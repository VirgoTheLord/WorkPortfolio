/*
 * CloudFront viewer-request function (runtime cloudfront-js-2.0) for alwxn.com.
 * Not part of the build: paste it into the distribution's function by hand and
 * publish it whenever it changes.
 *
 * The site's addresses carry no trailing slash (next.config.ts): /compact is
 * the file compact.html in the bucket, / is index.html. An address that ends
 * in a slash (old links to /compact/) is sent to the bare one for good, so
 * there is one address per page. Files with an extension (/_next/…, /icon.png)
 * pass through as they are.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- CloudFront calls it by name
function handler(event) {
  var request = event.request
  var uri = request.uri

  if (uri === '/') {
    request.uri = '/index.html'
    return request
  }

  if (uri.charAt(uri.length - 1) === '/') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.replace(/\/+$/, '') || '/' },
        'cache-control': { value: 'max-age=3600' },
      },
    }
  }

  var last = uri.substring(uri.lastIndexOf('/') + 1)
  if (last.indexOf('.') === -1) request.uri = uri + '.html'
  return request
}
