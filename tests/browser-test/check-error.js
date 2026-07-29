// 检查 dev server 错误信息
(async () => {
  console.log('=== 详细检查 500 错误 ===');
  const r = await fetch('http://localhost:3001/');
  const html = await r.text();
  console.log('status=' + r.status);

  const m = html.match(/<meta name="next-error" content="([^"]+)"/);
  console.log('next-error:', m ? m[1] : 'none');

  const m2 = html.match(/<title>([^<]+)<\/title>/);
  console.log('title:', m2 ? m2[1] : 'none');

  const errIdx = html.indexOf('Error:');
  if (errIdx > 0) console.log('error snippet:', html.substring(errIdx, errIdx + 300));

  const m3 = html.match(/Application error[^<]+/);
  if (m3) console.log('app err:', m3[0].substring(0, 300));

  // 输出前 2000 字符
  console.log('---');
  console.log(html.substring(0, 2000));
})();
