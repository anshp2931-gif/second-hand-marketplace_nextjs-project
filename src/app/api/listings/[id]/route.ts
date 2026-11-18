import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Listing from '@/models/Listing';
import { DEFAULT_LISTINGS } from '@/lib/sampleListings';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      await connectToDatabase();
      const listing = await Listing.findById(id).lean();
      if (listing) return NextResponse.json(listing);
    } catch (dbErr) {
      console.warn('DB lookup failed, trying fallback:', dbErr);
    }

    const fallback = DEFAULT_LISTINGS.find((item) => item._id === id) || DEFAULT_LISTINGS[0];
    return NextResponse.json(fallback);
  } catch (err: any) {
    return NextResponse.json(DEFAULT_LISTINGS[0]);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const updated = await Listing.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Listing.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
