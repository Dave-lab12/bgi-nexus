import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, url }) => {
	const json = (body: object, status = 200) =>
		new Response(JSON.stringify(body), {
			status,
			headers: { "Content-Type": "application/json" },
		});

	let name: string, email: string, connectAs: string, interestedIn: string, message: string;
	try {
		const body = await request.json();
		name = (body.name || "").trim();
		email = (body.email || "").trim().toLowerCase();
		connectAs = (body.connectAs || "").trim();
		interestedIn = (body.interestedIn || "").trim();
		message = (body.message || "").trim();
	} catch {
		return json({ error: "Invalid request" }, 400);
	}

	if (!name) return json({ error: "Please enter your name." }, 400);
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		return json({ error: "Please enter a valid email address." }, 400);

	const token = import.meta.env.EMDASH_API_TOKEN;
	if (!token) {
		console.error("EMDASH_API_TOKEN is not set");
		return json({ error: "Server configuration error." }, 500);
	}

	const slug = `${Date.now()}-${email.replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}`;

	const res = await fetch(`${url.origin}/_emdash/api/content/contact_messages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			slug,
			data: { title: `${name} <${email}>`, name, email, connect_as: connectAs, interested_in: interestedIn, message },
		}),
	});

	if (!res.ok) {
		console.error("EmDash contact create failed:", res.status, await res.text());
		return json({ error: "Something went wrong. Please try again." }, 500);
	}

	return json({ success: true });
};
