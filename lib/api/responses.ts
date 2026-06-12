import { NextResponse } from "next/server";

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

export const notFound = (message: string) =>
  NextResponse.json({ error: message }, { status: 404 });
