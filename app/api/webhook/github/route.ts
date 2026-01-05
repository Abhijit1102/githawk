import { NextResponse, NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event");

        console.log(`Received Github event : ${event}`);

        if(event === "ping"){
            return NextResponse.json({
                message: "Pong"
            }, {
                status: 200
            })
        }

        // TODO:  Handle Later
         
        return NextResponse.json({
            message: "Event Processes"
        }, {
            status: 200
        })
    } catch (error) {
        console.log("Error processing webhook : ", error);
        return NextResponse.json({
            error: "Internal Server Error"
        }, {
            status: 500
        });
    }
}