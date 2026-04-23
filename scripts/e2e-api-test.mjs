/**
 * E2E: register -> property -> tenant -> bill -> record payment
 * Run: node scripts/e2e-api-test.mjs
 */
const base = 'http://localhost:8080/api';

function rnd() {
  return Math.random().toString(36).slice(2, 10);
}

async function main() {
  const account = `autotest_${rnd()}`;
  console.log('==> Register', account);
  const regRes = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account,
      password: 'test123456',
      confirmPassword: 'test123456',
    }),
  });
  const reg = await regRes.json();
  if (!reg.success) throw new Error(`Register: ${reg.message}`);
  const token = reg.data.token;
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('==> Create property');
  const propRes = await fetch(`${base}/properties`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'E2E测试房源',
      propertyType: '住宅',
      address: '演示路88号',
      area: 90,
      rent: 3200,
      deposit: 6400,
      status: '空闲',
    }),
  });
  const prop = await propRes.json();
  if (!prop.success) throw new Error(`Property: ${prop.message}`);
  const propertyId = prop.data.id;
  console.log('    propertyId=', propertyId);

  console.log('==> Create tenant');
  const phone = `139${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`;
  const idCard = `1101011990${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`;
  const tenantRes = await fetch(`${base}/tenants`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'E2E租客',
      gender: '男',
      idCard,
      phone,
      email: `t_${phone}@ex.com`,
      propertyId,
    }),
  });
  const tenant = await tenantRes.json();
  if (!tenant.success) throw new Error(`Tenant: ${tenant.message}`);
  const tenantId = tenant.data.id;
  console.log('    tenantId=', tenantId);

  const due = new Date();
  due.setDate(due.getDate() + 7);
  const dueStr = due.toISOString().slice(0, 10);

  console.log('==> Create bill');
  const billRes = await fetch(`${base}/bills`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      propertyId,
      tenantId,
      billType: '租金',
      amount: 3200,
      dueDate: dueStr,
      status: '待支付',
    }),
  });
  const bill = await billRes.json();
  if (!bill.success) throw new Error(`Bill: ${bill.message}`);
  const billId = bill.data.id;
  console.log('    billId=', billId);

  console.log('==> Record payment');
  const today = new Date().toISOString().slice(0, 10);
  const payRes = await fetch(`${base}/bills/${billId}/pay`, {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({
      paidAmount: 3200,
      paidDate: today,
      paymentMethod: '微信支付',
      paymentReceipt: 'E2E收款',
    }),
  });
  const pay = await payRes.json();
  if (!pay.success) throw new Error(`Pay: ${pay.message}`);
  console.log('    status=', pay.data.status, 'paidAmount=', pay.data.paidAmount);

  console.log('\nAll steps passed.');
  console.log(`Login web: ${account} / test123456`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
