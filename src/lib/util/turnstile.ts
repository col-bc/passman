const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";

if (!TURNSTILE_SECRET_KEY) {
    throw new Error(
        "Turnstile secret key is not set in environment variables. Please set TURNSTILE_SECRET_KEY.",
    );
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                secret: TURNSTILE_SECRET_KEY,
                response: token,
            }),
        },
    );

    if (!response.ok) {
        console.error("Failed to verify Turnstile token:", response.statusText);
        return false;
    }

    const data = await response.json();
    return data.success;
}

export { verifyTurnstileToken };
