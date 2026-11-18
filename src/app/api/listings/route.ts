import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Listing from '@/models/Listing';
import { DEFAULT_LISTINGS } from '@/lib/sampleListings';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let filter: any = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    try {
      await connectToDatabase();
      let listings = await Listing.find(filter).sort({ createdAt: -1 }).lean();

      // If database is empty, auto-seed with default listings!
      if (!listings || listings.length === 0) {
        if (!category && !search) {
          try {
            await Listing.insertMany(
              DEFAULT_LISTINGS.map(({ _id, ...rest }) => rest)
            );
            listings = await Listing.find({}).sort({ createdAt: -1 }).lean();
          } catch (seedErr) {
            console.warn('Auto-seed insert error:', seedErr);
          }
        }
      }

      if (listings && listings.length > 0) {
        return NextResponse.json(listings);
      }
    } catch (dbErr) {
      console.warn('MongoDB query warning, using fallback dataset:', dbErr);
    }

    // Fail-safe fallback matching filters
    let results = [...DEFAULT_LISTINGS];
    if (category && category !== 'All') {
      results = results.filter((item) => item.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json(DEFAULT_LISTINGS);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const listing = await Listing.create(body);
    return NextResponse.json(listing, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
