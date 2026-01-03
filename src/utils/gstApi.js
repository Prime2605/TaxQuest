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
    const cachedData = localStorage.getItem('gst_token_data');
    if (cachedData) {
        const { token, expiry } = JSON.parse(cachedData);
        if (Date.now() < expiry) {
            return token;
        }
    }

    try {
        const authString = btoa(`${API_KEY}:${API_KEY}`);
        const response = await axios.post(`${BASE_URL}/gst/auth`, {}, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'x-api-key': API_KEY,
                'x-api-version': '1.0'
            }
        });

        const token = response.data.access_token || response.data.token;
        if (!token) throw new Error("Token not received");

        // Cache for 20 hours (in ms)
        const expiry = Date.now() + 20 * 60 * 60 * 1000;
        localStorage.setItem('gst_token_data', JSON.stringify({ token, expiry }));

        return token;
    } catch (error) {
        console.error("GST Auth Error:", error.response?.data || error.message);
        throw new Error("GST Authentication failed");
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
 * 4. generateEInvoice({clientGstin, amount}): POST /gst/einvoice/generate
 */
export const generateEInvoice = async ({ clientGstin, amount }) => {
    try {
        const token = await getToken();
        const response = await axios.post(`${BASE_URL}/gst/einvoice/generate`, {
            buyer_details: { gstin: clientGstin },
            value_details: { total_invoice_value: amount }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-api-key': API_KEY,
                'x-api-version': '1.0'
            }
        });

        return {
            qr: response.data.qr_code_base64,
            pdf: response.data.pdf_url
        };
    } catch (error) {
        console.error("E-Invoice Error:", error.response?.data || error.message);
        throw new Error("E-Invoice generation failed");
    }
};
