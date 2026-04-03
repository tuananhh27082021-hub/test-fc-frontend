import * as cheerio from 'cheerio';

type SNSInfo = {
  snsUrl: string;
  snsType: 'Y' | 'O';
  snsId?: string;
  snsTitle?: string;
  imageUrl?: string;
  snsDesc?: string;
  check: boolean;
};

const getHTML = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/html?url=${url}`);
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  }
};

const extractYouTubeId = (url: string): string | null => {
  const pattern
    = '(?<=watch\\?v=|/videos/|embed\\/|youtu.be\\/|\\/v\\/|watch\\?v%3D|%2Fvideos%2F|embed%2F|youtu.be%2F|%2Fv%2F)[^#&?\\n]*';
  const re = new RegExp(pattern);
  const match = re.exec(url);
  return match ? match[0] : null;
};

const getSocialMediaCheck = async (snsUrl: string): Promise<SNSInfo> => {
  const snsInfo: SNSInfo = {
    snsUrl: decodeURIComponent(decodeURIComponent(snsUrl)),
    snsType: 'O',
    check: true,
  };

  try {
    const { snsUrl: decodedUrl } = snsInfo;

    if (decodedUrl.includes('youtube') || decodedUrl.includes('youtu.be')) {
      snsInfo.snsType = 'Y';
      const youtubeId = extractYouTubeId(decodedUrl);

      if (!youtubeId) {
        snsInfo.check = false;
        return snsInfo;
      }

      snsInfo.snsId = youtubeId;
    }

    const html = await getHTML(decodedUrl);

    if (html) {
      const $ = cheerio.load(html);

      const titleBody = $('meta[property="og:title"]').attr('content');
      const imageBody = $('meta[property="og:image"]').attr('content');
      const descriptionBody = $('meta[property="og:description"]').attr(
        'content',
      );

      if (titleBody) {
        snsInfo.snsTitle = titleBody;
      }
      if (imageBody) {
        snsInfo.imageUrl = imageBody;
      }
      if (descriptionBody) {
        snsInfo.snsDesc = descriptionBody;
      }
    } else {
      snsInfo.check = false;
    }
  } catch (error) {
    snsInfo.check = false;
  }

  return snsInfo;
};

const uploadYouTubeThumbnail = async (youtubeId: string) => {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ youtubeId }),
  });

  if (!res.ok) {
    return { thumbNail: null };
  }

  return await res.json();
};

const uploadUrlThumbnail = async (url: string) => {
  const res = await fetch('/api/upload-thumbnail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    return { thumbNail: null };
  }

  return res.json();
};

export { getSocialMediaCheck, uploadUrlThumbnail, uploadYouTubeThumbnail };
