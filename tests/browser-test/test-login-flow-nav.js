// 完整登录流程 + nav 切换验证（终版）
const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const pg = await ctx.newPage()

  // 步骤 1: 进入登录页
  await pg.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(2500)
  const step1 = await pg.evaluate(() => ({
    hasPhone: !!document.querySelector('input[placeholder*="手机"]'),
    hasCode: !!document.querySelector('input[placeholder*="验证"]'),
    isLoggedIn: localStorage.getItem('isLoggedIn'),
  }))
  console.log('=== 步骤 1: 登录页加载（极简设计，无 nav）===')
  console.log('  hasPhone:', step1.hasPhone, '| hasCode:', step1.hasCode, '| isLoggedIn:', step1.isLoggedIn)

  // 步骤 2-4: 输入 + 发送 + 输入验证码
  const phoneInput = await pg.$('input[placeholder*="手机"]')
  await phoneInput.fill('13800138000')
  await pg.click('button:has-text("获取")')
  await pg.waitForTimeout(1500)
  const codeInput = await pg.$('input[placeholder*="验证"]')
  await codeInput.fill('6666')
  console.log('  ✅ 填写手机 + 验证码')

  // 步骤 5: 提交
  await pg.waitForSelector('[data-testid=login-submit]:not([disabled])', { timeout: 8000 })
  await pg.click('[data-testid=login-submit]')
  await pg.waitForTimeout(4500)
  console.log('  ✅ 提交登录')

  // 步骤 6: 跳到 /member 验证 nav 切换
  await pg.goto('http://localhost:3001/member', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(3000)
  const step6 = await pg.evaluate(() => ({
    url: location.pathname,
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    hasWorkspace: !!document.querySelector('[data-testid=workspace-link]'),
    hasAvatar: !!document.querySelector('[data-testid=avatar-button]'),
    hasLogin: !!document.querySelector('[data-testid=nav-login]'),
    hasSignup: !!document.querySelector('[data-testid=nav-signup]'),
  }))
  console.log('=== 步骤 6: 跳到 /member 后 nav 切换 ===')
  console.log('  URL:', step6.url, '| isLoggedIn:', step6.isLoggedIn)
  console.log('  Workspace:', step6.hasWorkspace, '| Avatar:', step6.hasAvatar, '| Login:', step6.hasLogin, '| Signup:', step6.hasSignup)

  // 步骤 7: 跳到首页验证持久
  await pg.goto('http://localhost:3001/', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(3500)
  const step7 = await pg.evaluate(() => ({
    url: location.pathname,
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    hasWorkspace: !!document.querySelector('[data-testid=workspace-link]'),
    hasAvatar: !!document.querySelector('[data-testid=avatar-button]'),
    hasLogin: !!document.querySelector('[data-testid=nav-login]'),
    hasSignup: !!document.querySelector('[data-testid=nav-signup]'),
  }))
  console.log('=== 步骤 7: 跳到首页 nav 持久 ===')
  console.log('  URL:', step7.url, '| isLoggedIn:', step7.isLoggedIn)
  console.log('  Workspace:', step7.hasWorkspace, '| Avatar:', step7.hasAvatar, '| Login:', step7.hasLogin, '| Signup:', step7.hasSignup)

  // 步骤 8: 退出登录
  const avatar = await pg.$('[data-testid=avatar-button]')
  if (avatar) {
    await avatar.click()
    await pg.waitForTimeout(800)
    const signoutBtn = await pg.$('[data-testid=dropdown-signout]')
    if (signoutBtn) {
      await signoutBtn.click()
      await pg.waitForTimeout(2500)
      console.log('  ✅ 点击退出登录')
    }
  }
  const step8 = await pg.evaluate(() => ({
    url: location.pathname,
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    hasWorkspace: !!document.querySelector('[data-testid=workspace-link]'),
    hasAvatar: !!document.querySelector('[data-testid=avatar-button]'),
    hasLogin: !!document.querySelector('[data-testid=nav-login]'),
    hasSignup: !!document.querySelector('[data-testid=nav-signup]'),
  }))
  console.log('=== 步骤 8: 退出登录后 ===')
  console.log('  URL:', step8.url, '| isLoggedIn:', step8.isLoggedIn)
  console.log('  Workspace:', step8.hasWorkspace, '| Avatar:', step8.hasAvatar, '| Login:', step8.hasLogin, '| Signup:', step8.hasSignup)

  // 步骤 8b: 跳转首页验证 nav 已切回未登录态
  await pg.goto('http://localhost:3001/', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(3000)
  const step8b = await pg.evaluate(() => ({
    url: location.pathname,
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    hasWorkspace: !!document.querySelector('[data-testid=workspace-link]'),
    hasAvatar: !!document.querySelector('[data-testid=avatar-button]'),
    hasLogin: !!document.querySelector('[data-testid=nav-login]'),
    hasSignup: !!document.querySelector('[data-testid=nav-signup]'),
  }))
  console.log('=== 步骤 8b: 跳回首页确认 nav 已切回 ===')
  console.log('  URL:', step8b.url, '| isLoggedIn:', step8b.isLoggedIn)
  console.log('  Workspace:', step8b.hasWorkspace, '| Avatar:', step8b.hasAvatar, '| Login:', step8b.hasLogin, '| Signup:', step8b.hasSignup)

  // 判定
  const s6Pass = step6.hasWorkspace && step6.hasAvatar && !step6.hasLogin && !step6.hasSignup && step6.isLoggedIn === 'true'
  const s7Pass = step7.hasWorkspace && step7.hasAvatar && !step7.hasLogin && !step7.hasSignup && step7.isLoggedIn === 'true'
  const s8Pass = step8.url === '/auth/login' && !step8.isLoggedIn
  const s8bPass = step8b.hasLogin && step8b.hasSignup && !step8b.hasWorkspace && !step8b.hasAvatar && !step8b.isLoggedIn
  console.log('---')
  console.log('步骤 6 (登录→/member):', s6Pass ? '✅' : '❌')
  console.log('步骤 7 (持久到首页):', s7Pass ? '✅' : '❌')
  console.log('步骤 8 (退出→/auth/login):', s8Pass ? '✅' : '❌')
  console.log('步骤 8b (退出后首页 nav 切回):', s8bPass ? '✅' : '❌')
  console.log('结果:', s6Pass && s7Pass && s8Pass && s8bPass ? '✅ ALL PASS（登录后 nav 立即 + 持久 + 退出完整闭环）' : '❌ FAIL')

  await browser.close()
})()
