const PLACEHOLDER = 'https://placehold.co/250x250?text=Gyeol-E-Deun';

export function getThumbnailUrls(product) {
  if (product.thumbnailUrls?.length > 0) {
    return product.thumbnailUrls;
  }
  if (product.thumbnailUrl) {
    return [product.thumbnailUrl];
  }
  return [];
}

export function getPrimaryThumbnail(product) {
  const urls = getThumbnailUrls(product);
  return urls[0] || PLACEHOLDER;
}
