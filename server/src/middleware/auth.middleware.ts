import { Request, Response, NextFunction } from 'express';

export const protectWithApiKey = (req: Request, res: Response, next: NextFunction): void => {
	const apiKey = req.headers['x-api-key'];
	const serverApiKey = process.env.API_SECRET_KEY;

	if (!serverApiKey) {
		console.error("FATAL: API_SECRET_KEY is not set on the server.");
		res.status(500).json({ message: "Server configuration error." });
		return;
	}

	if (apiKey && apiKey === serverApiKey) {
		next();
	} else {
		res.status(401).json({ message: 'Unauthorized: Missing or invalid API key.' });
	}
};