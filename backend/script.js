import http from "k6/http";
import { check } from "k6";

const FUNCTION = __ENV.FUNCTION;
const TOKEN = __ENV.TOKEN;
const PAYLOAD = JSON.parse(__ENV.PAYLOAD || "{}");

export const options = {
    vus: Number(__ENV.USERS) || 1,
    iterations: Number(__ENV.USERS) || 1,
};

export default function () {

    const url = `https://us-central1-mij-prepaid-meter-testing.cloudfunctions.net/${FUNCTION}`;

    const body = JSON.stringify({
        data: PAYLOAD   // ✅ correct for onCall
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`,
            "X-Firebase-AppCheck": "debug", // 🔥 important if App Check enabled
        }
    };

    const res = http.post(url, body, params);

    console.log(`Response: ${res.status} - ${res.body}`);

    check(res, {
        "status is 200": (r) => r.status === 200,
    });
}