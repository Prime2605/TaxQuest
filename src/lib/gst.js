import axios from 'axios';

const GST_KEY = import.meta.env.VITE_GST_KEY;
const BASE_URL = 'https://api.gst.gov.in'; // Placeholder if not specified, but let's assume a generic one or use a mock logic for demo

// Simulation of GST API since we don't have the full sandbox URL for this specific key
// In a real app, this would hit the actual GSP/ASP endpoint

export const getToken = async () => {
    // Simulate token generation
    return "simulated_token_" + GST_KEY;
};

export const verifyGSTIN = async (gstin) => {
    try {
        // In demo mode, we accept any valid-ish GSTIN or the test one provided
        const testGSTIN = "33GSPTN1882G1Z3";

        if (gstin === testGSTIN) {
            return {
                success: true,
                data: {
                    gstin: gstin,
                    tradeName: "Vanshika Enterprises",
                    legalName: "Vanshika Sharma",
                    status: "Active",
                    type: "Regular",
                    registrationDate: "2023-01-01"
                }
            };
        }

        // Simulate API call
        if (gstin.length !== 15) throw new Error("Invalid GSTIN length");

        return {
            success: true,
            data: {
                gstin: gstin,
                tradeName: "Informal Trader " + gstin.slice(-4),
                legalName: "Merchant " + gstin.slice(-4),
                status: "Active",
                type: "Composition",
                registrationDate: "2024-05-10"
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getReturns = async (gstin) => {
    try {
        // Simulate fetching returns
        return {
            success: true,
            data: [
                { period: "Jan 2024", status: "Filed", date: "2024-02-10" },
                { period: "Feb 2024", status: "Filed", date: "2024-03-12" },
                { period: "Mar 2024", status: "Pending", date: null },
            ]
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
