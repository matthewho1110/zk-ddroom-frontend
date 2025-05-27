// middleware.ts

import { get } from "./hooks/useEdgeConfig";
import { NextRequest, NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {}
// See "Matching Paths" below to learn more
