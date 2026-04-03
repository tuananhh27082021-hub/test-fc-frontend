import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { url, youtubeId } = await request.json();

  if (!url && !youtubeId) {
    return NextResponse.json(
      { error: 'Missing URL or YouTube ID' },
      { status: 400 },
    );
  }

  let thumbNail: File | undefined;

  if (youtubeId) {
    const thumbNailArr = [
      'maxresdefault.jpg',
      'sddefault.jpg',
      'hqdefault.jpg',
      'mqdefault.jpg',
      'default.jpg',
    ];

    for (const youtubeUrl of thumbNailArr) {
      const youtubeThumbnailUrl = `/yimage/${youtubeId}/${youtubeUrl}`;
      try {
        const res = await fetch(youtubeThumbnailUrl);
        if (res.ok) {
          const blob = await res.blob();
          thumbNail = new File([blob], 'thumbnail.jpg', { type: blob.type });
          break; // Exit loop once a valid thumbnail is found
        }
      } catch (error) {
        console.error('Error fetching YouTube thumbnail:', error);
      }
    }
  } else if (url) {
    const extensionArr = ['png', 'jpg', 'jpeg', 'gif'];
    let extension = 'jpg';

    for (const extensionStr of extensionArr) {
      if (url.toLowerCase().includes(`.${extensionStr}`)) {
        extension = extensionStr;
        break;
      }
    }

    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        thumbNail = new File([blob], `thumbnail.${extension}`, {
          type: blob.type,
        });
      }
    } catch (error) {
      console.error('Error fetching URL thumbnail:', error);
    }
  }

  if (thumbNail) {
    return NextResponse.json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      thumbNail,
    });
  }

  return NextResponse.json(
    { success: false, message: 'Failed to upload thumbnail' },
    { status: 400 },
  );
}
