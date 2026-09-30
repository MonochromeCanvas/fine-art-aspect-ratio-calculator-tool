(function (root) {
  'use strict';
  // Dollar bands are studio starting scopes, not Guild rate tables. See PRICING_REVIEW.md.
  const projects = {
    artwork: {
      illustration: { label: 'Small illustration / card artwork', low: 100, high: 800, unit: 'per illustration', scope: 'One basic line drawing through a more detailed or colored illustration. This is a starting range without royalties; intended use and requirements still need review.' },
      personal: { label: 'Loose personal artwork', low: 300, high: 500, scope: 'A simple personal piece with clear references and a loose finish.' },
      portrait: { label: 'Developed personal portrait or artwork', low: 950, high: 1400, scope: 'One more fully developed portrait, pet, home or personal artwork. Size, medium and references are confirmed together.' },
      custom: { label: 'A collection, larger commission or another idea', scope: 'Share the idea, scale and intended use. Joëlle will help define a sensible starting scope rather than guess a price for a complex project.' }
    },
    design: {
      'design-piece': { label: 'Print or digital design piece', low: 650, high: 950, scope: 'One defined layout or design piece with supplied copy and images. Printing is separate.' },
      logo: { label: 'Focused logo', low: 850, high: 1100, scope: 'One focused logo mark with final vector files and a basic handoff. Normal use by your business is part of the brief, not an automatic surcharge.' },
      identity: { label: 'Logo + starter identity', low: 1900, high: 2600, scope: 'A logo, color and typography direction, and basic usage notes. Those included files and notes are not charged twice.' },
      campaign: { label: 'Small campaign or event materials', low: 1350, high: 2050, scope: 'A coordinated set of event or campaign materials. We will agree on the pieces and adaptations before quoting.' },
      custom: { label: 'Packaging, a larger identity system or another idea', scope: 'Tell Joëlle about your business, audience and the pieces you need. A larger system needs a tailored scope.' }
    },
    mural: {
      'first-look': { label: 'Mural first look', low: 350, high: 500, scope: 'One initial visual direction only. Finished artwork, wall-photo mockup, production files and site visits belong to a later scope.' },
      'full-design': { label: 'Complete mural design', low: 2400, high: 3500, scope: 'Mural artwork and a wall-photo mockup using supplied photos and measurements. Painting, installation and detailed production support are separate.' },
      handoff: { label: 'Mural artwork + painter-ready handoff', low: 3200, high: 4800, scope: 'Mural artwork, mockup, painter-ready files and practical color and placement guidance. Painting and installation are separate.' },
      custom: { label: 'Multiple walls, public art or another idea', scope: 'Share your space, approximate size and any team or approval needs. Joëlle will help shape a design scope with you.' }
    }
  };
  const money = value => '$' + value.toLocaleString('en-US');
  const range = p => p.low == null ? 'Let’s talk' : money(p.low) + '–' + money(p.high);
  function calculateEstimate(kind, options = {}) {
    const catalog = projects[kind];
    if (!catalog) throw new Error('Unknown planner');
    const key = Object.prototype.hasOwnProperty.call(catalog, options.project) ? options.project : 'custom';
    const project = catalog[key];
    const parsed = Number(options.quantity);
    const quantityValid = Number.isInteger(parsed) && parsed >= 1 && parsed <= 500;
    const quantity = key === 'illustration' && quantityValid ? parsed : 1;
    const royalty = key === 'illustration' && options.payment === 'royalty';
    const rightsNote = options.usage === 'broad'
      ? 'Expanded rights, resale or additional locations need a separate discussion. The starting range does not include a buyout or unrestricted use.'
      : kind === 'mural'
        ? 'Use at the agreed mural site is part of the design brief. Reproduction or merchandise use is discussed separately.'
        : 'We’ll agree where and how you can use the work. Commercial use does not automatically mean a large campaign fee.';
    return { kind, key, label: project.label, low: project.low ?? null, high: project.high ?? null,
      range: royalty ? 'Let’s discuss terms' : range(project),
      referenceRange: range(project), quantity, quantityValid: key !== 'illustration' || quantityValid,
      royalty, unit: project.unit || 'for this starting scope', scope: project.scope, rightsNote,
      collectionNote: key === 'illustration' && quantity > 1
        ? quantity + ' distinct illustrations noted. The range above is per illustration, not the whole collection. Joëlle will quote the series together, including any shared design work and royalty terms.' : '',
      note: royalty
        ? 'Without royalties, the starting reference is $100–$800 per illustration. An upfront fee + royalties is negotiated for the whole project; no discount is assumed here.'
        : project.low == null ? 'You don’t need a finished brief. Start with your idea.' : 'A planning range, not a final quote. ' + (project.unit ? 'Price shown ' + project.unit + '.' : 'Price shown for the scope below.')
    };
  }
  function buildSummary(e, options = {}) {
    return [ 'Project idea for Joëlle', '', 'Project: ' + e.label,
      'Starting point: ' + e.range + (e.low != null && !e.royalty ? ' (' + e.unit + ')' : ''),
      e.scope, e.note, e.collectionNote,
      e.key === 'illustration' ? 'Distinct illustrations: ' + (e.quantityValid ? e.quantity : 'To confirm') : '',
      e.key === 'illustration' ? 'Payment preference: ' + ({flat:'Upfront fee, without royalties', royalty:'Discuss a fee + royalties', unsure:'Not sure yet'}[options.payment] || 'Not sure yet') : '',
      'Intended use: ' + (options.usageLabel || 'To discuss'), e.rightsNote,
      'Deadline: ' + (options.deadline || 'Open'), 'Budget: ' + (options.budget || 'Open'),
      'My idea: ' + (options.brief || 'I’d like help choosing a starting point.'), '',
      'Scope, revisions, timing, rights and final price to be confirmed before work begins.'
    ].filter(line => line !== '').join('\n');
  }
  function init(kind) {
    const doc = root.document;
    if (!doc) return;
    const form = doc.getElementById('plannerForm');
    if (!form) return;
    const byId = id => doc.getElementById(id);
    const projectSelect = byId('project');
    for (const [key, p] of Object.entries(projects[kind])) {
      if (key === 'custom') continue;
      const option = doc.createElement('option');option.value = key;option.textContent = p.label;projectSelect.append(option);
    }
    let summary = '';
    function render() {
      const options = { project: projectSelect.value, quantity: byId('quantity')?.value ?? 1,
        payment: byId('payment')?.value, usage: byId('usage').value,
        usageLabel: byId('usage').selectedOptions[0].textContent,
        deadline: byId('deadline').value.trim(), budget: byId('budget').value.trim(), brief: byId('brief').value.trim() };
      const e = calculateEstimate(kind, options);
      if (byId('quantityField')) {
        byId('quantityField').hidden = e.key !== 'illustration';
        byId('paymentField').hidden = e.key !== 'illustration';
        byId('quantity').disabled = e.key !== 'illustration';
        byId('payment').disabled = e.key !== 'illustration';
      }
      byId('rangeLabel').textContent = e.key === 'illustration' ? 'Starting point · per illustration' : 'Your starting point';
      if (byId('planningRange').textContent !== e.range) byId('planningRange').textContent = e.range;
      if (byId('rangeNote').textContent !== e.note) byId('rangeNote').textContent = e.note;
      byId('scopeNote').textContent = e.scope;
      byId('rightsNote').textContent = e.rightsNote;
      byId('collectionNote').hidden = !e.collectionNote;
      byId('collectionNote').textContent = e.collectionNote;
      summary = buildSummary(e, options);
      byId('emailLink').href = 'mailto:mnchrmcnvs@gmail.com?subject=' + encodeURIComponent('Project idea — ' + e.label) + '&body=' + encodeURIComponent(summary);
      byId('copyStatus').textContent = '';
      for (const card of doc.querySelectorAll('[data-project]')) card.setAttribute('aria-pressed', String(card.dataset.project === e.key));
    }
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', render);form.addEventListener('change', render);
    for (const card of doc.querySelectorAll('[data-project]')) card.addEventListener('click', () => {
      projectSelect.value = card.dataset.project;render();
      byId('workspace-title').focus();
      byId('workspace-title').scrollIntoView({block:'start',behavior:root.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    });
    byId('copyButton').addEventListener('click', async () => {
      try { await root.navigator.clipboard.writeText(summary);byId('copyStatus').textContent = 'Copied. Paste these notes into an email whenever you’re ready.'; }
      catch { byId('copyStatus').textContent = 'Copy isn’t available in this browser. Use “Talk with Joëlle” to open an email with your notes.'; }
    });
    render();
  }
  const api = { projects, calculateEstimate, buildSummary, init };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.mcPricingPlanner = api;
})(typeof window !== 'undefined' ? window : globalThis);
