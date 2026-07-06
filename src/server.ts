import { createServer } from "node:http";

import { createAppResponse } from "./app.js";

const port = +(process.env.PORT ?? "3000");

const server = createServer(async (request, response) => {
    try {
        if (request.method !== "GET" && request.method !== "HEAD") {
            response.writeHead(405, {
                Allow: "GET, HEAD",
                "Content-Type": "text/plain; charset=UTF-8",
            });
            response.end("Method Not Allowed\n");
            return;
        }

        const forwardedHeader = request.headers["x-forwarded-host"];
        const forwardedHost = (Array.isArray(forwardedHeader) ? forwardedHeader[0] : forwardedHeader)
            ?.split(",")[0]?.trim();
        const rawHost = (forwardedHost || request.headers.host || "").replace(/:\d+$/, "");
        const requestUrl = new URL(request.url ?? "/", "http://localhost");
        const result = await createAppResponse(rawHost, requestUrl.pathname, requestUrl.search.slice(1));

        response.writeHead(result.statusCode, {
            "Content-Type": result.contentType,
        });
        response.end(request.method === "HEAD" ? undefined : result.body);
    } catch (error) {
        console.error("Request failed", error);
        if (!response.headersSent) {
            response.writeHead(500, { "Content-Type": "text/plain; charset=UTF-8" });
        }
        response.end("Internal Server Error\n");
    }
});

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
