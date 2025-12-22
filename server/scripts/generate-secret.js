#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Mini Admin 安全密钥生成工具');
console.log('================================');

// 生成JWT密钥
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('\n📝 JWT Secret (请复制到 .env 文件中):');
console.log('JWT_SECRET="' + jwtSecret + '"');

// 生成数据库密码建议
const dbPassword = crypto.randomBytes(16).toString('hex');
console.log('\n🗄️  建议的数据库密码:');
console.log('DATABASE_URL="mysql://root:' + dbPassword + '@localhost:3306/mini_admin"');

// 安全配置提醒
console.log('\n⚠️  安全提醒:');
console.log('1. 请立即更新 .env 文件中的配置');
console.log('2. 不要将 .env 文件提交到Git仓库');
console.log('3. 在生产环境中使用更强的密码策略');
console.log('4. 定期轮换JWT密钥');
console.log('5. 考虑使用更短的JWT过期时间(如2小时)');

// 生成.env文件模板
const envTemplate = `DATABASE_URL="mysql://root:${dbPassword}@localhost:3306/mini_admin"
JWT_SECRET="${jwtSecret}"
JWT_EXPIRES_IN="2h"
PORT=3000`;

console.log('\n📄 完整的 .env 文件模板:');
console.log('================================');
console.log(envTemplate);
console.log('================================');