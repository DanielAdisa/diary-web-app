import { NextRequest, NextResponse } from 'next/server';
import { getEntryById } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    // Get the entry ID from the URL query params
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'No entry ID provided' }, { status: 400 });
    }
    
    // Get the entry from storage
    const entry = await getEntryById(id);
    
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    // Return the entry data
    return NextResponse.json({
      title: entry.title,
      content: entry.content,
      date: entry.date,
      imageUrls: entry.imageUrls,
      audioUrl: entry.audioUrl || null
    });
    
  } catch (error) {
    console.error('Error fetching diary entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
