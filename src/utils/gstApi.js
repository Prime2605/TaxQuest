import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_KEY = import.meta.env.VITE_GST_KEY;
const BASE_URL = 'https://api.sandbox.co.in';

/**
 * 1. getToken(): POST /gst/auth 
 * → Basic Auth base64(key:key) 
 * → 24hr Bearer token (cache localStorage 20hr)
 */
export const getToken = async () => {
    if (!API_KEY) {
        toast.error("GST API Key missing in .env.local");
        throw new Error("API Key missing");
    }

    const cachedData = localStorage.getItem('gst_token_data');
    if (cachedData) {
        const { token, expiry } = JSON.parse(cachedData);
        if (Date.now() < expiry) return token;
    }

    try {
        // Quicko/Sandbox.co.in Auth: Base64(apiKey:apiKey) is the most common for Sandbox
        const authString = btoa(`${API_KEY}:${API_KEY}`);
        const response = await axios.post(`${BASE_URL}/gst/auth`, {}, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'x-api-key': API_KEY,
                'x-api-version': '1.0'
            }
        });

        const token = response.data.access_token || response.data.token || response.data.data?.access_token;
        if (!token) throw new Error("No token in response");

        const expiry = Date.now() + 20 * 60 * 60 * 1000;
        localStorage.setItem('gst_token_data', JSON.stringify({ token, expiry }));
        return token;
    } catch (error) {
        const msg = error.response?.data?.message || error.message;
        console.error("GST Auth Error Detail:", error.response?.data);
        if (msg.includes("Invalid API Key")) {
            toast.error("GST API Key is invalid or not for Sandbox!");
        }
        throw new Error(`GST Auth Failed: ${msg}`);
    }
};

/**
 * 2. verifyGSTIN(gstin): GET /gst/public/taxpayer/gstin/{gstin}
 */
export const verifyGSTIN = async (gstin) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9]{1}[Z][A-Z0-9]{1}$/;
    if (!gstinRegex.test(gstin)) {
        throw new Error("Wrong format: Invalid GSTIN structure");
    }

    try {
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}/gst/public/taxpayer/gstin/${gstin}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-api-key': API_KEY,
                'x-api-version': '1.0'
            }
        });

        return {
            status: response.data.status || response.data.data?.stj,
            tradeName: response.data.trade_name || response.data.data?.lgnm || "Trader",
            state: response.data.state || response.data.data?.stjcd || "India",
            data: response.data.data || response.data
        };
    } catch (error) {
        const status = error.response?.status;
        if (status === 400) throw new Error("Wrong format");
        if (status === 404) throw new Error("Apply GST? Taxpayer not found");
        if (status === 401) {
            localStorage.removeItem('gst_token_data');
            return verifyGSTIN(gstin); // Retry once
        }
        throw new Error("GSTN busy: Connection failed");
    }
};

/**
 * 3. getReturnsStatus(gstin): GET /gst/taxpayer/returns/{gstin}?type=GSTR3B
 */
export const getReturnsStatus = async (gstin) => {
    try {
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}/gst/taxpayer/returns/${gstin}`, {
            params: { type: 'GSTR3B' },
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-api-key': API_KEY,
                'x-api-version': '1.0'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Returns Status Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch GST returns");
    }
};

/**
 * 4. generateEInvoice({clientGstin, amount, items, sellerGstin, sellerTradeName, docNumber, buyerName, location}): POST /gst/einvoice/generate
 */
export const generateEInvoice = async ({
    clientGstin,
    amount,
    items = [],
    sellerGstin,
    sellerTradeName = 'TaxQuest Trader',
    docNumber = `TQ-${Date.now()}`,
    buyerName = 'Client',
    location = '32-Kerala'
}) => {
    try {
        const token = await getToken();
        const sanitizedItems = (items.length ? items : [{
            description: "Kerala Pepper Packs",
            hsn_code: "090411",
            quantity: 1,
            unit_price: amount
        }]).map((item, idx) => ({
            description: item.description || `Item ${idx + 1}`,
            hsn_code: item.hsn_code || "010110",
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unit_price) || 0,
            total_amount: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0)
        }));

        const response = await axios.post(`${BASE_URL}/gst/einvoice/generate`, {
            doc_details: {
                doc_type: "INV",
                doc_num: docNumber,
                doc_date: new Date().toISOString().slice(0, 10)
            },
            buyer_details: {
                gstin: clientGstin,
                trade_name: buyerName,
                place_of_supply: location
            },
            seller_details: {
                gstin: sellerGstin,
                legal_name: sellerTradeName,
                place_of_supply: location
            },
            item_list: sanitizedItems,
            value_details: {
                total_invoice_value: Number(amount),
                total_item_value: sanitizedItems.reduce((sum, i) => sum + (i.total_amount || 0), 0)
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-api-key': API_KEY,
                'x-api-version': '1.0'
            }
        });

        return {
            qr: response.data.qr_code_base64,
            pdf: response.data.pdf_url || response.data.signed_pdf_url,
            raw: response.data
        };
    } catch (error) {
        console.error("E-Invoice Error:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            localStorage.removeItem('gst_token_data');
            return generateEInvoice({ clientGstin, amount, items, sellerGstin, sellerTradeName, docNumber, buyerName, location });
        }
        throw new Error("E-Invoice generation failed");
    }
};
