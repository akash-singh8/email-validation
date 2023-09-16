import { Request, Response } from "express";

const getEmail = (req: Request, res: Response) => {
  const email = req.body.email;
  res.json({ email: email });
};

export default getEmail;
