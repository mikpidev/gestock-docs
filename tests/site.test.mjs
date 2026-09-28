import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

const roles = ["superadmin", "org_admin", "store_admin", "user"];

const matrix = [
  ["companies.*", "yes", "no", "no", "no"],
  ["stores.*", "yes", "yes", "no", "no"],
  ["users.*", "yes", "yes", "yes", "no"],
  ["roles.assign", "yes", "yes", "yes", "no"],
  ["tax_info.*", "yes", "yes", "yes", "no"],
  ["hacienda_access.*", "yes", "yes", "yes", "no"],
  ["correlatives.*", "yes", "yes", "yes", "no"],
  ["dashboard.view", "yes", "yes", "yes", "no"],
  ["dashboard.download_pdf", "yes", "yes", "yes", "no"],
  ["sales.*", "yes", "yes", "yes", "yes"],
  ["customers.*", "yes", "yes", "yes", "yes"],
  ["products.*", "yes", "yes", "yes", "yes"],
  ["credit_notes.*", "yes", "yes", "yes", "yes"],
  ["debit_notes.*", "yes", "yes", "yes", "yes"],
  ["dte.download", "yes", "yes", "yes", "yes"],
  ["dte.download_bulk", "yes", "yes", "yes", "yes"],
  ["contingencies.*", "yes", "yes", "yes", "yes"],
];

function rowFor(html, permission) {
  const token = `data-permission="${permission}"`;
  const attrAt = html.indexOf(token);
  assert.notEqual(attrAt, -1, permission);
  const trStart = html.lastIndexOf("<tr", attrAt);
  const trEnd = html.indexOf("</tr>", attrAt);
  return html.slice(trStart, trEnd);
}

test("API users matrix matches the role grid", () => {
  const html = read("api/users.html");
  const found = [...html.matchAll(/data-permission="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(found, matrix.map((row) => row[0]));
  assert.equal([...html.matchAll(/data-access="/g)].length, matrix.length * roles.length);

  const header = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
  const headerRoles = [...header.matchAll(/<code[^>]*>(.*?)<\/code>/g)].map((match) => match[1]);
  assert.deepEqual(headerRoles, roles);

  for (const [permission, ...access] of matrix) {
    const row = rowFor(html, permission);
    const cells = [...row.matchAll(/data-access="(yes|no)"/g)].map((match) => match[1]);
    assert.deepEqual(cells, access, permission);
    assert.equal([...row.matchAll(/aria-label="Permitido"/g)].length, access.filter((cell) => cell === "yes").length);
    assert.equal([...row.matchAll(/aria-label="Denegado"/g)].length, access.filter((cell) => cell === "no").length);
  }
});

test("home page carries the required shell copy", () => {
  const home = read("index.html");
  assert.match(home, /<title>Gestock Knowledge Base<\/title>/);
  assert.match(home, /<h1>Gestock Knowledge Base<\/h1>/);
  assert.match(home, /Gestock — POS en la nube \+ DTE para El Salvador\./);
  assert.match(home, /En desarrollo \/ Under construction/);
  assert.match(home, /políticas de tenant se documentan por separado/);
  assert.match(home, /guías del SaaS se publicarán después/);
  assert.match(home, /href="api\/users\.html"/);
  assert.match(home, /id="kb-search"/);
  assert.equal([...home.matchAll(/SaaS · Próximamente/g)].length, 8);
  assert.match(home, /API · Publicado/);
});

test("matrix page keeps tenant policy and hybrid scope visible", () => {
  const users = read("api/users.html");
  assert.match(users, /<h1>\[API\] Users<\/h1>/);
  assert.match(users, /En desarrollo \/ Under construction/);
  assert.match(users, /Esta matriz documenta la API/);
  assert.match(users, /guías de uso del SaaS se publicarán aparte/);
  assert.match(users, /políticas de tenant son independientes/);
  assert.match(users, /Gestock — POS en la nube \+ DTE para El Salvador\./);
});

test("brand tokens are the Gestock reds, not a blue theme", () => {
  const css = read("assets/css/site.css");
  for (const token of ["#af2828", "#ff0000", "#f3f3f3", "#1a1a1a", "#5c5c5c"]) {
    assert.ok(css.toLowerCase().includes(token), token);
  }
  assert.match(css, /#ff0000 0%, #af2828 100%/);
  assert.doesNotMatch(css, /netsapiens/i);
  assert.doesNotMatch(read("index.html") + read("api/users.html") + read("README.md"), /gestock_saas/i);
});

test("README hands deploy and DNS to Miguel and leaves CMS open", () => {
  const readme = read("README.md");
  assert.match(readme, /documentation\.gestock\.site/);
  assert.match(readme, /Miguel/);
  assert.match(readme, /CNAME/);
  assert.match(readme, /CMS/);
  assert.match(readme, /TBD|por definir|not implemented|do not implement/i);
  for (const permission of matrix.map((row) => row[0])) {
    assert.ok(readme.includes(permission), permission);
  }
  for (const role of roles) {
    assert.ok(readme.includes(role), role);
  }
});
