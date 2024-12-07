import './createPost.js';

import { Devvit, useAsync, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Webview Example',
  height: 'tall',
  render: (context) => {
    console.log('rendering post')

    // Load username with `useAsync` hook
    useAsync(async () => {
      console.log('getting current user');
      const currUser = await context.reddit.getCurrentUser();
      console.log({currUser});
      context.ui.webView.postMessage('myWebView', {
        type: 'user',
        value: currUser?.username || '...',
      });
      return {};
    });

    // Load latest counter from redis with `useAsync` hook
    useAsync(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      const countValue = Number(redisCount ?? 0);
      context.ui.webView.postMessage('myWebView', {
        type: 'count',
        value: countValue,
      });
      return {};
    })

    // When the web view invokes `window.parent.postMessage` this function is called
    const onMessage = async (msg: any) => {
      if (msg.type === 'updateCounter') {
        await context.redis.set(`counter_${context.postId}`, msg.value);
      }
    };

    // Render the custom post type
    return (
      <vstack border="thick" borderColor="black" height="100%">
        <webview
          id="myWebView"
          url="preview.html"
          onMessage={(msg) => onMessage(msg)}
          grow
          height="100%"
        />
      </vstack>
    );
  },
});

export default Devvit;
