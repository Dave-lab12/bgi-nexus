import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, url }) => {
	const json = (body: object, status = 200) =>
		new Response(JSON.stringify(body), {
			status,
			headers: { "Content-Type": "application/json" },
		});

	let email: string;
	try {
		const body = await request.json();
		email = (body.email || "").trim().toLowerCase();
	} catch {
		return json({ error: "Invalid request" }, 400);
	}

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ error: "Please enter a valid email address." }, 400);
	}

	const token = import.meta.env.EMDASH_API_TOKEN;
	if (!token) {
		console.error("EMDASH_API_TOKEN is not set");
		return json({ error: "Server configuration error." }, 500);
	}

	// Use email as slug (sanitized) so duplicate subscriptions get a 409
	const slug = email.replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

	const referer = request.headers.get("referer") || "";
	const source = referer.includes("/events") ? "events" : referer.includes("/contact") ? "contact" : "homepage";

	const res = await fetch(`${url.origin}/_emdash/api/content/subscribers`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ slug, data: { email, source } }),
	});

	if (res.status === 409) {
		// Already subscribed — treat as success
		return json({ success: true });
	}

	if (!res.ok) {
		console.error("EmDash subscriber create failed:", res.status, await res.text());
		return json({ error: "Something went wrong. Please try again." }, 500);
	}

	return json({ success: true });
};
