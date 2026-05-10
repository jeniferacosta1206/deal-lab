import React, { useState, useEffect, useMemo } from 'react';
import { Home, Building2, Layers, GitCompare, Save, Trash2, FolderOpen, Plus, X, TrendingUp, TrendingDown, FileText, LogOut, Mail, Lock, CreditCard, Sparkles, AlertCircle, Tag } from 'lucide-react';
import { supabase } from './supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ============================================================
// ACOSTA BRAND TOKENS
// Navy #434A60 | Slate #9AAAB1 | Cream #E8E5DE | Charcoal #383736
// Display: Cormorant Garamond (Caslon alternative) | Body: Open Sans | Mono: JetBrains Mono
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Open+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    .font-display { font-family: 'Cormorant Garamond', 'Adobe Caslon Pro', Georgia, serif; }
    .font-body { font-family: 'Open Sans', system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .bg-cream { background-color: #E8E5DE; }
    .bg-cream-light { background-color: #F3F1EC; }
    .bg-cream-dark { background-color: #D8D3C8; }
    .bg-navy { background-color: #434A60; }
    .bg-navy-dark { background-color: #353A4D; }
    .bg-slate-blue { background-color: #9AAAB1; }
    .bg-slate-soft { background-color: #D4DCE0; }
    .bg-charcoal { background-color: #383736; }
    .bg-white-pure { background-color: #FFFFFF; }

    .text-navy { color: #434A60; }
    .text-slate-blue { color: #9AAAB1; }
    .text-charcoal { color: #383736; }
    .text-charcoal-soft { color: #5C5B5A; }
    .text-charcoal-muted { color: #8A8987; }
    .text-cream { color: #E8E5DE; }
    .text-positive { color: #4A6B52; }
    .text-negative { color: #8B3A3A; }

    .border-navy { border-color: #434A60; }
    .border-slate { border-color: #9AAAB1; }
    .border-slate-soft { border-color: #C4CCD0; }
    .border-cream-dark { border-color: #D8D3C8; }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type="number"] { -moz-appearance: textfield; }

    .metric-enter { animation: fadeUp 0.35s ease-out; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .display-italic { font-style: italic; font-weight: 500; }

    .paper-bg {
      background-color: #E8E5DE;
      background-image: radial-gradient(circle at 20% 30%, rgba(67, 74, 96, 0.03) 0%, transparent 40%),
                        radial-gradient(circle at 80% 70%, rgba(56, 55, 54, 0.02) 0%, transparent 40%);
    }
  `}</style>
);

const fmtMoney = (n, decimals = 0) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const neg = n < 0;
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return neg ? `-$${formatted}` : `$${formatted}`;
};
const fmtPct = (n, decimals = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return `${(n * 100).toFixed(decimals)}%`;
};
const fmtNum = (n, decimals = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return n.toFixed(decimals);
};

const pmt = (principal, annualRate, years) => {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const NumberInput = ({ label, value, onChange, prefix, suffix, hint, step = 1 }) => (
  <label className="block">
    <div className="flex items-baseline justify-between mb-1.5">
      <span className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft">{label}</span>
      {hint && <span className="text-[10px] font-body italic text-charcoal-muted">{hint}</span>}
    </div>
    <div className="relative flex items-center border border-slate-soft bg-white-pure rounded focus-within:border-navy focus-within:shadow-sm transition-all">
      {prefix && <span className="pl-3 pr-1 font-mono text-sm text-charcoal-muted">{prefix}</span>}
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        placeholder="0"
        className={`w-full py-2.5 ${prefix ? 'pl-0' : 'pl-3'} ${suffix ? 'pr-1' : 'pr-3'} bg-transparent font-mono text-sm text-charcoal outline-none`}
      />
      {suffix && <span className="pr-3 pl-1 font-mono text-sm text-charcoal-muted">{suffix}</span>}
    </div>
  </label>
);

const Output = ({ label, value, emphasis, status, sublabel }) => {
  const colorClass =
    status === 'positive' ? 'text-positive' :
    status === 'negative' ? 'text-negative' :
    emphasis ? 'text-navy' : 'text-charcoal';
  const sizeClass = emphasis ? 'text-3xl font-display display-italic' : 'text-base font-mono';
  return (
    <div className="metric-enter flex items-baseline justify-between py-2.5 border-b border-cream-dark last:border-b-0">
      <div className="flex flex-col">
        <span className={`text-[10px] font-body font-semibold uppercase tracking-[0.12em] ${emphasis ? 'text-charcoal' : 'text-charcoal-soft'}`}>
          {label}
        </span>
        {sublabel && <span className="text-[10px] font-body italic text-charcoal-muted mt-0.5">{sublabel}</span>}
      </div>
      <span className={`${sizeClass} ${colorClass} tabular-nums`}>{value}</span>
    </div>
  );
};

const Section = ({ title, children, icon: Icon }) => (
  <div className="mb-7">
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate">
      {Icon && <Icon size={13} className="text-slate-blue" strokeWidth={1.5} />}
      <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

// Tab-style toggle for "Total / Per Unit / Per SF" entry modes
const ModeSelector = ({ value, onChange, options }) => (
  <div className="inline-flex border border-slate-soft rounded overflow-hidden bg-white-pure">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.12em] transition-colors ${
          value === opt.value
            ? 'bg-navy text-cream'
            : 'text-charcoal-soft hover:bg-cream-light hover:text-navy'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// Single editable row for a unit type
const UnitTypeRow = ({ unit, onChange, onRemove, mode }) => (
  <div className="grid grid-cols-12 gap-2 items-center p-3 bg-white-pure border border-slate-soft rounded">
    <input
      type="text"
      value={unit.label}
      onChange={(e) => onChange({ ...unit, label: e.target.value })}
      placeholder="1BR"
      className="col-span-3 px-2 py-1.5 font-body text-sm text-charcoal outline-none bg-transparent border-b border-cream-dark focus:border-navy"
    />
    <div className="col-span-2 flex items-center gap-1">
      <input
        type="number"
        value={unit.count === 0 ? '' : unit.count}
        onChange={(e) => onChange({ ...unit, count: parseFloat(e.target.value) || 0 })}
        placeholder="0"
        className="w-full text-right font-mono text-sm text-charcoal outline-none bg-transparent border-b border-cream-dark focus:border-navy"
      />
      <span className="font-mono text-[10px] text-charcoal-muted">×</span>
    </div>
    <div className="col-span-3 flex items-center gap-1">
      <input
        type="number"
        value={unit.sizeSqft === 0 ? '' : unit.sizeSqft}
        onChange={(e) => onChange({ ...unit, sizeSqft: parseFloat(e.target.value) || 0 })}
        placeholder="0"
        className="w-full text-right font-mono text-sm text-charcoal outline-none bg-transparent border-b border-cream-dark focus:border-navy"
      />
      <span className="font-mono text-[10px] text-charcoal-muted">sf</span>
    </div>
    <div className="col-span-3 flex items-center gap-1">
      <span className="font-mono text-[10px] text-charcoal-muted">$</span>
      <input
        type="number"
        value={(mode === 'rent' ? unit.rentMonthly : unit.salePrice) === 0 ? '' : (mode === 'rent' ? unit.rentMonthly : unit.salePrice)}
        onChange={(e) => onChange({
          ...unit,
          [mode === 'rent' ? 'rentMonthly' : 'salePrice']: parseFloat(e.target.value) || 0
        })}
        placeholder="0"
        className="w-full text-right font-mono text-sm text-charcoal outline-none bg-transparent border-b border-cream-dark focus:border-navy"
      />
      <span className="font-mono text-[10px] text-charcoal-muted">{mode === 'rent' ? '/mo' : ''}</span>
    </div>
    <button
      onClick={onRemove}
      className="col-span-1 text-charcoal-muted hover:text-negative transition-colors flex justify-end"
      title="Remove unit type"
    >
      <X size={14} strokeWidth={2} />
    </button>
  </div>
);

const UnitTypeRowHeader = ({ mode }) => (
  <div className="grid grid-cols-12 gap-2 px-3 mb-1">
    <div className="col-span-3 text-[9px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-muted">Type</div>
    <div className="col-span-2 text-[9px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-muted text-right">Count</div>
    <div className="col-span-3 text-[9px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-muted text-right">Size</div>
    <div className="col-span-3 text-[9px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-muted text-right">{mode === 'rent' ? 'Rent / mo' : 'Sale Price'}</div>
    <div className="col-span-1"></div>
  </div>
);

const defaultRent = {
  purchasePrice: 0,
  // Construction Cost (was rehab)
  constructionMode: 'total', // 'total' | 'perUnit' | 'perSf'
  constructionTotal: 0,
  constructionPerUnit: 0,
  constructionPerSf: 0,
  // Closing costs as percentage of (purchase + construction)
  closingCostsPct: 3,
  // Multi-unit type income input
  unitTypes: [
    { id: 1, label: '1BR', count: 0, sizeSqft: 0, rentMonthly: 0 },
  ],
  otherIncomeMonthly: 0, vacancyPct: 5,
  taxesAnnual: 0, insuranceAnnual: 0, pmPctOfEGI: 8, maintenancePctOfEGI: 5,
  reservesPerUnit: 300, utilitiesAnnual: 0, otherOpexAnnual: 0,
  ltvPct: 75, ratePct: 6.5, amortYears: 20, loanTerm: 5,
};

const calcRent = (d) => {
  // Handle backward compat for old saved deals
  const unitTypes = d.unitTypes || [];
  const totalUnits = unitTypes.reduce((s, u) => s + (u.count || 0), 0);
  const totalSqft = unitTypes.reduce((s, u) => s + (u.count || 0) * (u.sizeSqft || 0), 0);
  const grossMonthlyRent = unitTypes.reduce((s, u) => s + (u.count || 0) * (u.rentMonthly || 0), 0);
  const avgRentPerSf = totalSqft > 0 ? grossMonthlyRent / totalSqft : 0;

  // Construction cost based on mode
  let constructionCost = 0;
  if (d.constructionMode === 'perUnit') {
    constructionCost = (d.constructionPerUnit || 0) * totalUnits;
  } else if (d.constructionMode === 'perSf') {
    constructionCost = (d.constructionPerSf || 0) * totalSqft;
  } else {
    constructionCost = d.constructionTotal || 0;
  }

  const closingCosts = (d.purchasePrice + constructionCost) * ((d.closingCostsPct || 0) / 100);
  const totalAcq = d.purchasePrice + constructionCost + closingCosts;
  const gsi = grossMonthlyRent * 12;
  const vacancy = gsi * (d.vacancyPct / 100);
  const egi = gsi - vacancy + d.otherIncomeMonthly * 12;
  const pmCost = egi * (d.pmPctOfEGI / 100);
  const maintCost = egi * (d.maintenancePctOfEGI / 100);
  const reserves = d.reservesPerUnit * totalUnits;
  const opex = d.taxesAnnual + d.insuranceAnnual + pmCost + maintCost + reserves + d.utilitiesAnnual + d.otherOpexAnnual;
  const noi = egi - opex;
  const capRate = totalAcq > 0 ? noi / totalAcq : 0;
  const loanAmt = totalAcq * (d.ltvPct / 100);
  const downPayment = totalAcq - loanAmt;
  const monthlyPmt = pmt(loanAmt, d.ratePct / 100, d.amortYears);
  const annualDebtService = monthlyPmt * 12;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
  const cashFlow = noi - annualDebtService;
  const coc = downPayment > 0 ? cashFlow / downPayment : 0;
  const opexRatio = egi > 0 ? opex / egi : 0;
  return {
    totalUnits, totalSqft, grossMonthlyRent, avgRentPerSf, constructionCost, closingCosts,
    totalAcq, gsi, vacancy, egi, opex, noi, capRate, loanAmt, downPayment,
    annualDebtService, dscr, cashFlow, coc, opexRatio, pmCost, maintCost, reserves
  };
};

const RentCalculator = ({ data, setData, results }) => {
  const up = (k) => (v) => setData({ ...data, [k]: v });

  const updateUnit = (id, newUnit) => {
    setData({ ...data, unitTypes: data.unitTypes.map(u => u.id === id ? newUnit : u) });
  };
  const addUnit = () => {
    const newId = Math.max(0, ...data.unitTypes.map(u => u.id)) + 1;
    setData({ ...data, unitTypes: [...data.unitTypes, { id: newId, label: 'Unit', count: 0, sizeSqft: 0, rentMonthly: 0 }] });
  };
  const removeUnit = (id) => {
    if (data.unitTypes.length === 1) return; // keep at least one
    setData({ ...data, unitTypes: data.unitTypes.filter(u => u.id !== id) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Section title="Acquisition" icon={Home}>
          <NumberInput label="Purchase Price" prefix="$" value={data.purchasePrice} onChange={up('purchasePrice')} step={1000} />
          <NumberInput label="Closing Costs" suffix="% of acq + construction" value={data.closingCostsPct} onChange={up('closingCostsPct')} step={0.25} hint={fmtMoney(results.closingCosts)} />
        </Section>

        <div className="mb-7">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Home size={13} className="text-slate-blue" strokeWidth={1.5} />
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Construction Cost</h3>
            </div>
            <ModeSelector
              value={data.constructionMode}
              onChange={up('constructionMode')}
              options={[
                { value: 'total', label: 'Total' },
                { value: 'perUnit', label: 'Per Unit' },
                { value: 'perSf', label: 'Per SF' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.constructionMode === 'total' && (
              <NumberInput label="Construction Cost (total)" prefix="$" value={data.constructionTotal} onChange={up('constructionTotal')} step={1000} />
            )}
            {data.constructionMode === 'perUnit' && (
              <>
                <NumberInput label="Cost per Unit" prefix="$" value={data.constructionPerUnit} onChange={up('constructionPerUnit')} step={1000} />
                <div className="flex items-end">
                  <div className="text-xs font-body italic text-charcoal-muted">
                    Total: <span className="font-mono not-italic">{fmtMoney(results.constructionCost)}</span> ({results.totalUnits} units)
                  </div>
                </div>
              </>
            )}
            {data.constructionMode === 'perSf' && (
              <>
                <NumberInput label="Cost per Square Foot" prefix="$" suffix="/sf" value={data.constructionPerSf} onChange={up('constructionPerSf')} step={1} />
                <div className="flex items-end">
                  <div className="text-xs font-body italic text-charcoal-muted">
                    Total: <span className="font-mono not-italic">{fmtMoney(results.constructionCost)}</span> ({results.totalSqft.toLocaleString()} sf)
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-7">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate">
            <div className="flex items-center gap-2">
              <Home size={13} className="text-slate-blue" strokeWidth={1.5} />
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Income — Unit Types</h3>
            </div>
            <button onClick={addUnit} className="flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-slate-blue hover:text-navy transition-colors">
              <Plus size={11} strokeWidth={2} /> Add Unit Type
            </button>
          </div>
          <UnitTypeRowHeader mode="rent" />
          <div className="space-y-2">
            {data.unitTypes.map(unit => (
              <UnitTypeRow
                key={unit.id}
                unit={unit}
                onChange={(updated) => updateUnit(unit.id, updated)}
                onRemove={() => removeUnit(unit.id)}
                mode="rent"
              />
            ))}
          </div>
          <div className="mt-3 px-3 text-xs font-body italic text-charcoal-muted">
            Totals: <span className="font-mono not-italic">{results.totalUnits}</span> units,{' '}
            <span className="font-mono not-italic">{results.totalSqft.toLocaleString()}</span> sf,{' '}
            <span className="font-mono not-italic">{fmtMoney(results.grossMonthlyRent)}/mo</span>
            {results.avgRentPerSf > 0 && (
              <> ({fmtMoney(results.avgRentPerSf, 2)}/sf/mo avg)</>
            )}
          </div>
        </div>

        <Section title="Other Income & Vacancy">
          <NumberInput label="Other Income (monthly)" prefix="$" value={data.otherIncomeMonthly} onChange={up('otherIncomeMonthly')} step={25} hint="laundry, parking" />
          <NumberInput label="Vacancy" suffix="%" value={data.vacancyPct} onChange={up('vacancyPct')} step={0.5} />
        </Section>

        <Section title="Operating Expenses">
          <NumberInput label="Property Taxes (annual)" prefix="$" value={data.taxesAnnual} onChange={up('taxesAnnual')} step={100} />
          <NumberInput label="Insurance (annual)" prefix="$" value={data.insuranceAnnual} onChange={up('insuranceAnnual')} step={100} />
          <NumberInput label="Property Mgmt" suffix="% of EGI" value={data.pmPctOfEGI} onChange={up('pmPctOfEGI')} step={0.5} />
          <NumberInput label="Maintenance" suffix="% of EGI" value={data.maintenancePctOfEGI} onChange={up('maintenancePctOfEGI')} step={0.5} />
          <NumberInput label="Reserves" prefix="$" suffix="/unit/yr" value={data.reservesPerUnit} onChange={up('reservesPerUnit')} step={50} />
          <NumberInput label="Utilities (annual)" prefix="$" value={data.utilitiesAnnual} onChange={up('utilitiesAnnual')} step={100} />
          <NumberInput label="Other OpEx (annual)" prefix="$" value={data.otherOpexAnnual} onChange={up('otherOpexAnnual')} step={100} />
        </Section>

        <Section title="Financing">
          <NumberInput label="LTV" suffix="%" value={data.ltvPct} onChange={up('ltvPct')} step={1} />
          <NumberInput label="Interest Rate" suffix="%" value={data.ratePct} onChange={up('ratePct')} step={0.125} />
          <NumberInput label="Loan Term" suffix="years" value={data.loanTerm} onChange={up('loanTerm')} step={1} hint="balloon / maturity" />
          <NumberInput label="Amortization" suffix="years" value={data.amortYears} onChange={up('amortYears')} step={1} hint="payment basis" />
        </Section>
      </div>
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-6 bg-white-pure border border-slate-soft shadow-sm p-6 rounded">
          <div className="mb-5">
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Returns</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Year One</h3>
          </div>
          <Output label="Cap Rate" value={fmtPct(results.capRate)} emphasis status={results.capRate >= 0.07 ? 'positive' : results.capRate >= 0.05 ? undefined : 'negative'} />
          <Output label="DSCR" value={fmtNum(results.dscr)} emphasis status={results.dscr >= 1.25 ? 'positive' : results.dscr >= 1.0 ? undefined : 'negative'} />
          <Output label="Cash-on-Cash" value={fmtPct(results.coc)} emphasis status={results.coc >= 0.08 ? 'positive' : results.coc >= 0 ? undefined : 'negative'} />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Total Units" value={`${results.totalUnits}`} />
            <Output label="Total Sqft" value={results.totalSqft.toLocaleString()} />
            <Output label="Gross Rent (annual)" value={fmtMoney(results.gsi)} />
            <Output label="Construction Cost" value={fmtMoney(results.constructionCost)} />
            <Output label="Closing Costs" value={fmtMoney(results.closingCosts)} />
            <Output label="Total Acquisition" value={fmtMoney(results.totalAcq)} />
            <Output label="Effective Gross Income" value={fmtMoney(results.egi)} />
            <Output label="Operating Expenses" value={fmtMoney(results.opex)} sublabel={`${fmtPct(results.opexRatio, 0)} of EGI`} />
            <Output label="Net Operating Income" value={fmtMoney(results.noi)} />
            <Output label="Loan Amount" value={fmtMoney(results.loanAmt)} />
            <Output label="Down Payment" value={fmtMoney(results.downPayment)} />
            <Output label="Annual Debt Service" value={fmtMoney(results.annualDebtService)} />
            <Output label="Cash Flow" value={fmtMoney(results.cashFlow)} status={results.cashFlow >= 0 ? 'positive' : 'negative'} />
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultSale = {
  // Multi-unit type sale input
  unitTypes: [
    { id: 1, label: 'Unit', count: 0, sizeSqft: 0, salePrice: 0 },
  ],
  landCost: 0,
  // Hard cost mode and values
  hardCostsMode: 'total', // 'total' | 'perUnit' | 'perSf'
  hardCostsTotal: 0,
  hardCostsPerUnit: 0,
  hardCostsPerSf: 0,
  softCostsPct: 20, financingCostsPct: 5, contingencyPct: 10, devFeePct: 0,
  saleCostsPct: 6,
};

const calcSale = (d) => {
  const unitTypes = d.unitTypes || [];
  const totalUnits = unitTypes.reduce((s, u) => s + (u.count || 0), 0);
  const totalSqft = unitTypes.reduce((s, u) => s + (u.count || 0) * (u.sizeSqft || 0), 0);
  const grossSale = unitTypes.reduce((s, u) => s + (u.count || 0) * (u.salePrice || 0), 0);

  // Hard costs based on mode
  let hardCosts = 0;
  if (d.hardCostsMode === 'perUnit') {
    hardCosts = (d.hardCostsPerUnit || 0) * totalUnits;
  } else if (d.hardCostsMode === 'perSf') {
    hardCosts = (d.hardCostsPerSf || 0) * totalSqft;
  } else {
    hardCosts = d.hardCostsTotal || 0;
  }

  const softCosts = hardCosts * (d.softCostsPct / 100);
  const financingCosts = (hardCosts + softCosts) * (d.financingCostsPct / 100);
  const subtotal = d.landCost + hardCosts + softCosts + financingCosts;
  const contingency = subtotal * (d.contingencyPct / 100);
  const preDevFee = subtotal + contingency;
  const devFee = preDevFee * (d.devFeePct / 100);
  const tdc = preDevFee + devFee;
  const saleCosts = grossSale * (d.saleCostsPct / 100);
  const netSale = grossSale - saleCosts;
  const profit = netSale - tdc;
  const margin = netSale > 0 ? profit / netSale : 0;
  const returnOnCost = tdc > 0 ? profit / tdc : 0;
  const costPerUnit = totalUnits > 0 ? tdc / totalUnits : 0;
  const costPerSf = totalSqft > 0 ? tdc / totalSqft : 0;
  return {
    totalUnits, totalSqft, hardCosts, softCosts, financingCosts, contingency, devFee, tdc,
    grossSale, saleCosts, netSale, profit, margin, returnOnCost, costPerUnit, costPerSf
  };
};

const SaleCalculator = ({ data, setData, results }) => {
  const up = (k) => (v) => setData({ ...data, [k]: v });

  const updateUnit = (id, newUnit) => {
    setData({ ...data, unitTypes: data.unitTypes.map(u => u.id === id ? newUnit : u) });
  };
  const addUnit = () => {
    const newId = Math.max(0, ...data.unitTypes.map(u => u.id)) + 1;
    setData({ ...data, unitTypes: [...data.unitTypes, { id: newId, label: 'Unit', count: 0, sizeSqft: 0, salePrice: 0 }] });
  };
  const removeUnit = (id) => {
    if (data.unitTypes.length === 1) return;
    setData({ ...data, unitTypes: data.unitTypes.filter(u => u.id !== id) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Section title="Land" icon={Building2}>
          <NumberInput label="Land / Acquisition" prefix="$" value={data.landCost} onChange={up('landCost')} step={1000} />
        </Section>

        <div className="mb-7">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate">
            <div className="flex items-center gap-2">
              <Building2 size={13} className="text-slate-blue" strokeWidth={1.5} />
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Sale — Unit Types</h3>
            </div>
            <button onClick={addUnit} className="flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-slate-blue hover:text-navy transition-colors">
              <Plus size={11} strokeWidth={2} /> Add Unit Type
            </button>
          </div>
          <UnitTypeRowHeader mode="sale" />
          <div className="space-y-2">
            {data.unitTypes.map(unit => (
              <UnitTypeRow
                key={unit.id}
                unit={unit}
                onChange={(updated) => updateUnit(unit.id, updated)}
                onRemove={() => removeUnit(unit.id)}
                mode="sale"
              />
            ))}
          </div>
          <div className="mt-3 px-3 text-xs font-body italic text-charcoal-muted">
            Totals: <span className="font-mono not-italic">{results.totalUnits}</span> units,{' '}
            <span className="font-mono not-italic">{results.totalSqft.toLocaleString()}</span> sf,{' '}
            <span className="font-mono not-italic">{fmtMoney(results.grossSale)}</span> gross sale
          </div>
        </div>

        <div className="mb-7">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Building2 size={13} className="text-slate-blue" strokeWidth={1.5} />
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Hard Costs</h3>
            </div>
            <ModeSelector
              value={data.hardCostsMode}
              onChange={up('hardCostsMode')}
              options={[
                { value: 'total', label: 'Total' },
                { value: 'perUnit', label: 'Per Unit' },
                { value: 'perSf', label: 'Per SF' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.hardCostsMode === 'total' && (
              <NumberInput label="Hard Costs (total)" prefix="$" value={data.hardCostsTotal} onChange={up('hardCostsTotal')} step={1000} hint="construction" />
            )}
            {data.hardCostsMode === 'perUnit' && (
              <>
                <NumberInput label="Cost per Unit" prefix="$" value={data.hardCostsPerUnit} onChange={up('hardCostsPerUnit')} step={1000} />
                <div className="flex items-end">
                  <div className="text-xs font-body italic text-charcoal-muted">
                    Total: <span className="font-mono not-italic">{fmtMoney(results.hardCosts)}</span> ({results.totalUnits} units)
                  </div>
                </div>
              </>
            )}
            {data.hardCostsMode === 'perSf' && (
              <>
                <NumberInput label="Cost per Square Foot" prefix="$" suffix="/sf" value={data.hardCostsPerSf} onChange={up('hardCostsPerSf')} step={1} />
                <div className="flex items-end">
                  <div className="text-xs font-body italic text-charcoal-muted">
                    Total: <span className="font-mono not-italic">{fmtMoney(results.hardCosts)}</span> ({results.totalSqft.toLocaleString()} sf)
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Section title="Other Development Costs">
          <NumberInput label="Soft Costs" suffix="% of hard" value={data.softCostsPct} onChange={up('softCostsPct')} step={1} hint="arch, eng, legal" />
          <NumberInput label="Financing Costs" suffix="% of H+S" value={data.financingCostsPct} onChange={up('financingCostsPct')} step={0.5} hint="interest, fees" />
          <NumberInput label="Contingency" suffix="%" value={data.contingencyPct} onChange={up('contingencyPct')} step={1} />
          <NumberInput label="Developer Fee" suffix="% of TDC" value={data.devFeePct} onChange={up('devFeePct')} step={1} />
        </Section>

        <Section title="Sale Costs">
          <NumberInput label="Sale Costs" suffix="%" value={data.saleCostsPct} onChange={up('saleCostsPct')} step={0.5} hint="commission, closing" />
        </Section>
      </div>
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-6 bg-white-pure border border-slate-soft shadow-sm p-6 rounded">
          <div className="mb-5">
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Returns</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Development</h3>
          </div>
          <Output label="Profit" value={fmtMoney(results.profit)} emphasis status={results.profit >= 0 ? 'positive' : 'negative'} />
          <Output label="Profit Margin" value={fmtPct(results.margin)} emphasis status={results.margin >= 0.15 ? 'positive' : results.margin >= 0.10 ? undefined : 'negative'} sublabel="Profit ÷ Net Sale" />
          <Output label="Return on Cost" value={fmtPct(results.returnOnCost)} emphasis status={results.returnOnCost >= 0.20 ? 'positive' : results.returnOnCost >= 0.10 ? undefined : 'negative'} sublabel="Profit ÷ TDC" />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Total Units" value={`${results.totalUnits}`} />
            <Output label="Total Sqft" value={results.totalSqft.toLocaleString()} />
            <Output label="Hard Costs" value={fmtMoney(results.hardCosts)} />
            <Output label="Soft Costs" value={fmtMoney(results.softCosts)} />
            <Output label="Financing Costs" value={fmtMoney(results.financingCosts)} />
            <Output label="Contingency" value={fmtMoney(results.contingency)} />
            <Output label="Developer Fee" value={fmtMoney(results.devFee)} />
            <Output label="Total Development Cost" value={fmtMoney(results.tdc)} />
            <Output label="Cost / Unit" value={fmtMoney(results.costPerUnit)} />
            <Output label="Cost / SF" value={fmtMoney(results.costPerSf, 2)} />
            <Output label="Gross Sale" value={fmtMoney(results.grossSale)} />
            <Output label="Sale Costs" value={fmtMoney(results.saleCosts)} />
            <Output label="Net Sale Proceeds" value={fmtMoney(results.netSale)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultGap = {
  tdc: 0, supportableDebt: 0, developerEquity: 0,
  subsidies: [
    { id: 1, name: 'HOME Funds', amount: 0 },
    { id: 2, name: 'LIHTC Equity', amount: 0 },
    { id: 3, name: 'Historic Tax Credits', amount: 0 },
    { id: 4, name: 'CDBG Funds', amount: 0 },
    { id: 5, name: 'Other Grants', amount: 0 },
  ],
};

const calcGap = (d) => {
  const subsidyTotal = d.subsidies.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalSources = d.supportableDebt + d.developerEquity + subsidyTotal;
  const gap = d.tdc - totalSources;
  const debtPct = d.tdc > 0 ? d.supportableDebt / d.tdc : 0;
  const equityPct = d.tdc > 0 ? d.developerEquity / d.tdc : 0;
  const subsidyPct = d.tdc > 0 ? subsidyTotal / d.tdc : 0;
  const gapPct = d.tdc > 0 ? gap / d.tdc : 0;
  return { subsidyTotal, totalSources, gap, debtPct, equityPct, subsidyPct, gapPct };
};

const GapCalculator = ({ data, setData, results }) => {
  const up = (k) => (v) => setData({ ...data, [k]: v });
  const updateSubsidy = (id, field, value) => {
    setData({ ...data, subsidies: data.subsidies.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };
  const addSubsidy = () => {
    const newId = Math.max(0, ...data.subsidies.map(s => s.id)) + 1;
    setData({ ...data, subsidies: [...data.subsidies, { id: newId, name: 'New Source', amount: 0 }] });
  };
  const removeSubsidy = (id) => {
    setData({ ...data, subsidies: data.subsidies.filter(s => s.id !== id) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Section title="Total Uses" icon={Layers}>
          <NumberInput label="Total Development Cost" prefix="$" value={data.tdc} onChange={up('tdc')} step={10000} hint="from Sale tab" />
        </Section>
        <Section title="Primary Sources">
          <NumberInput label="Supportable Debt" prefix="$" value={data.supportableDebt} onChange={up('supportableDebt')} step={10000} hint="from NOI / sale" />
          <NumberInput label="Developer Equity" prefix="$" value={data.developerEquity} onChange={up('developerEquity')} step={10000} />
        </Section>
        <div className="mb-7">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate">
            <div className="flex items-center gap-2">
              <Layers size={13} className="text-slate-blue" strokeWidth={1.5} />
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Subsidy Stack</h3>
            </div>
            <button onClick={addSubsidy} className="flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-slate-blue hover:text-navy transition-colors">
              <Plus size={11} strokeWidth={2} /> Add Source
            </button>
          </div>
          <div className="space-y-2">
            {data.subsidies.map(s => (
              <div key={s.id} className="flex items-center gap-2 p-3 bg-white-pure border border-slate-soft rounded">
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateSubsidy(s.id, 'name', e.target.value)}
                  className="flex-1 font-body text-sm text-charcoal outline-none bg-transparent"
                  placeholder="Source name"
                />
                <span className="font-mono text-sm text-charcoal-muted">$</span>
                <input
                  type="number"
                  value={s.amount === 0 ? '' : s.amount}
                  onChange={(e) => updateSubsidy(s.id, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-32 text-right font-mono text-sm text-charcoal outline-none bg-transparent"
                />
                <button onClick={() => removeSubsidy(s.id)} className="text-charcoal-muted hover:text-negative transition-colors">
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-6 bg-white-pure border border-slate-soft shadow-sm p-6 rounded">
          <div className="mb-5">
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Analysis</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Capital Stack</h3>
          </div>
          <Output
            label={results.gap > 0 ? 'Funding Gap' : results.gap < 0 ? 'Surplus' : 'Balanced'}
            value={fmtMoney(Math.abs(results.gap))}
            emphasis
            status={results.gap > 0 ? 'negative' : results.gap < 0 ? 'positive' : undefined}
            sublabel={fmtPct(Math.abs(results.gapPct), 1) + ' of TDC'}
          />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Total Uses (TDC)" value={fmtMoney(data.tdc)} />
            <Output label="Debt" value={fmtMoney(data.supportableDebt)} sublabel={fmtPct(results.debtPct, 1)} />
            <Output label="Equity" value={fmtMoney(data.developerEquity)} sublabel={fmtPct(results.equityPct, 1)} />
            <Output label="Subsidy Total" value={fmtMoney(results.subsidyTotal)} sublabel={fmtPct(results.subsidyPct, 1)} />
            <Output label="Total Sources" value={fmtMoney(results.totalSources)} />
          </div>
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <div className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft mb-2">Stack Composition</div>
            <div className="h-7 flex overflow-hidden border border-slate-soft rounded-sm">
              {data.tdc > 0 && (
                <>
                  <div className="bg-navy" style={{ width: `${Math.max(0, Math.min(100, results.debtPct * 100))}%` }} title="Debt" />
                  <div className="bg-slate-blue" style={{ width: `${Math.max(0, Math.min(100, results.equityPct * 100))}%` }} title="Equity" />
                  <div className="bg-charcoal" style={{ width: `${Math.max(0, Math.min(100, results.subsidyPct * 100))}%` }} title="Subsidy" />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-body text-charcoal-soft">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-navy inline-block rounded-full"></span>Debt</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-blue inline-block rounded-full"></span>Equity</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-charcoal inline-block rounded-full"></span>Subsidy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultComp = { holdYears: 5, rentGrowthPct: 3, expenseGrowthPct: 2.5, exitCapPct: 7, saleAppreciationPct: 3 };

const calcComparison = (rent, sale, comp) => {
  const rentResults = calcRent(rent);
  const saleResults = calcSale(sale);
  const saleYearN = saleResults.profit * Math.pow(1 + comp.saleAppreciationPct / 100, comp.holdYears);
  let cumulativeCF = 0;
  let currentNOI = rentResults.noi;
  const annualDS = rentResults.annualDebtService;
  for (let y = 1; y <= comp.holdYears; y++) {
    const yearIncome = rentResults.egi * Math.pow(1 + comp.rentGrowthPct / 100, y - 1);
    const yearOpex = rentResults.opex * Math.pow(1 + comp.expenseGrowthPct / 100, y - 1);
    const yearNOI = yearIncome - yearOpex;
    if (y === comp.holdYears) currentNOI = yearNOI;
    cumulativeCF += yearNOI - annualDS;
  }
  const exitValue = comp.exitCapPct > 0 ? currentNOI / (comp.exitCapPct / 100) : 0;
  const r = rent.ratePct / 100 / 12;
  const monthlyPmt = pmt(rentResults.loanAmt, rent.ratePct / 100, rent.amortYears);
  let balance = rentResults.loanAmt;
  for (let m = 0; m < comp.holdYears * 12 && balance > 0; m++) {
    const interest = balance * r;
    const principal = monthlyPmt - interest;
    balance -= principal;
  }
  const netReversion = exitValue - Math.max(0, balance) - exitValue * 0.06;
  const rentTotalReturn = cumulativeCF + netReversion - rentResults.downPayment;
  const rentEquityMultiple = rentResults.downPayment > 0 ? (cumulativeCF + netReversion) / rentResults.downPayment : 0;
  return { rentResults, saleResults, saleYearN, cumulativeCF, exitValue, loanBalance: Math.max(0, balance), netReversion, rentTotalReturn, rentEquityMultiple, winner: rentTotalReturn > saleResults.profit ? 'rent' : 'sale' };
};

const ComparisonView = ({ rent, sale, comp, setComp, results }) => {
  const up = (k) => (v) => setComp({ ...comp, [k]: v });
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate">
          <GitCompare size={13} className="text-slate-blue" strokeWidth={1.5} />
          <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Comparison Assumptions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <NumberInput label="Hold Period" suffix="years" value={comp.holdYears} onChange={up('holdYears')} step={1} />
          <NumberInput label="Rent Growth" suffix="%/yr" value={comp.rentGrowthPct} onChange={up('rentGrowthPct')} step={0.25} />
          <NumberInput label="Expense Growth" suffix="%/yr" value={comp.expenseGrowthPct} onChange={up('expenseGrowthPct')} step={0.25} />
          <NumberInput label="Exit Cap" suffix="%" value={comp.exitCapPct} onChange={up('exitCapPct')} step={0.25} />
          <NumberInput label="Sale Proceeds Growth" suffix="%/yr" value={comp.saleAppreciationPct} onChange={up('saleAppreciationPct')} step={0.5} />
        </div>
        <p className="text-xs font-body italic text-charcoal-muted mt-3">
          Uses inputs from the For-Rent and For-Sale tabs. Update those tabs to change the underlying deal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white-pure border border-slate-soft shadow-sm rounded">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-dark">
            <div>
              <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Scenario</div>
              <h3 className="font-display text-3xl display-italic text-navy leading-none">Sell</h3>
            </div>
            {results.winner === 'sale' && <span className="text-[9px] font-body font-semibold uppercase tracking-[0.15em] bg-navy text-cream px-2 py-1 rounded">Higher Return</span>}
          </div>
          <Output label="Year 0 Profit" value={fmtMoney(results.saleResults.profit)} emphasis status={results.saleResults.profit >= 0 ? 'positive' : 'negative'} />
          <Output label="Profit Margin" value={fmtPct(results.saleResults.margin)} />
          <Output label={`Value at Year ${comp.holdYears}`} value={fmtMoney(results.saleYearN)} sublabel="reinvested at assumed growth" />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Total Development Cost" value={fmtMoney(results.saleResults.tdc)} />
            <Output label="Net Sale Proceeds" value={fmtMoney(results.saleResults.netSale)} />
          </div>
        </div>

        <div className="p-6 bg-white-pure border border-slate-soft shadow-sm rounded">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-dark">
            <div>
              <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Scenario</div>
              <h3 className="font-display text-3xl display-italic text-navy leading-none">Hold &amp; Rent</h3>
            </div>
            {results.winner === 'rent' && <span className="text-[9px] font-body font-semibold uppercase tracking-[0.15em] bg-navy text-cream px-2 py-1 rounded">Higher Return</span>}
          </div>
          <Output label={`${comp.holdYears}-Yr Total Return`} value={fmtMoney(results.rentTotalReturn)} emphasis status={results.rentTotalReturn >= 0 ? 'positive' : 'negative'} sublabel="after return of equity" />
          <Output label="Equity Multiple" value={`${fmtNum(results.rentEquityMultiple)}x`} />
          <Output label="Year 1 Cap Rate" value={fmtPct(results.rentResults.capRate)} />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Cumulative Cash Flow" value={fmtMoney(results.cumulativeCF)} />
            <Output label={`Exit Value (${comp.exitCapPct}% cap)`} value={fmtMoney(results.exitValue)} />
            <Output label="Loan Balance at Exit" value={fmtMoney(results.loanBalance)} />
            <Output label="Net Reversion" value={fmtMoney(results.netReversion)} sublabel="after 6% sale costs" />
            <Output label="Equity Invested" value={fmtMoney(results.rentResults.downPayment)} />
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 bg-slate-soft border-l-4 border-navy rounded-r">
        <div className="flex items-start gap-3">
          {results.rentTotalReturn > results.saleResults.profit ? <TrendingUp size={16} className="text-slate-blue mt-0.5" strokeWidth={2} /> : <TrendingDown size={16} className="text-slate-blue mt-0.5" strokeWidth={2} />}
          <div className="text-sm font-body text-charcoal">
            <span className="font-semibold">{results.winner === 'rent' ? 'Hold & rent' : 'Sell'}{' '}</span>
            produces a higher nominal return over {comp.holdYears} years, assuming the inputs above.
            Difference: <span className="font-mono font-semibold">{fmtMoney(Math.abs(results.rentTotalReturn - results.saleResults.profit))}</span>.
            Consider risk, liquidity, and tax treatment separately.
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthScreen = ({ onTermsClick }) => {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login' | 'magic' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const reset = () => {
    setError('');
    setInfo('');
  };

  const switchMode = (m) => {
    setMode(m);
    reset();
  };

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSignUp = async () => {
    reset();
    if (!validateEmail(email)) return setError('Please enter a valid email');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (!agreedToTerms) return setError('You must agree to the Terms of Use');

    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { first_name: firstName.trim() },
        },
      });
      if (signUpError) throw signUpError;

      // Create profile entry once user exists
      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName.trim(),
          email: email.trim(),
          terms_accepted_at: new Date().toISOString(),
        });
      }

      if (data?.user && !data.session) {
        // Email confirmation enabled
        setInfo('Check your email to confirm your account, then come back here to log in.');
      } else {
        // Auto-signed-in (if email confirmation is disabled)
        setInfo('Welcome to Deal Lab.');
      }
    } catch (e) {
      setError(e.message || 'Sign-up failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    reset();
    if (!validateEmail(email)) return setError('Please enter a valid email');
    if (!password) return setError('Enter your password');

    setSubmitting(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) throw loginError;
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    reset();
    if (!validateEmail(email)) return setError('Please enter a valid email');

    setSubmitting(true);
    try {
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (linkError) throw linkError;
      setInfo('Check your email for a sign-in link.');
    } catch (e) {
      setError(e.message || 'Could not send magic link');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    reset();
    if (!validateEmail(email)) return setError('Please enter a valid email');

    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setInfo('If an account exists for that email, a password reset link is on its way.');
    } catch (e) {
      setError(e.message || 'Could not send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="paper-bg min-h-screen flex items-center justify-center p-4">
      <GlobalStyles />
      <div className="bg-cream-light border-2 border-navy max-w-md w-full overflow-hidden rounded shadow-2xl">
        <div className="p-6 bg-navy">
          <div className="text-[10px] font-body uppercase tracking-[0.3em] text-slate-blue mb-2">Acosta Development</div>
          <h1 className="font-display text-4xl text-cream leading-none">
            <span className="display-italic">Deal</span> Lab
          </h1>
          <p className="text-xs font-body italic text-slate-blue mt-3">
            {mode === 'signup' ? 'Create your account to begin' :
             mode === 'magic' ? 'Sign in via email link' :
             mode === 'reset' ? 'Reset your password' :
             'Welcome back'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-slate-soft">
          <button onClick={() => switchMode('signup')} className={`flex-1 py-3 text-[10px] font-body font-semibold uppercase tracking-[0.15em] transition-colors ${mode === 'signup' ? 'bg-cream-light text-navy border-b-2 border-navy' : 'text-charcoal-soft hover:text-navy'}`}>Sign Up</button>
          <button onClick={() => switchMode('login')} className={`flex-1 py-3 text-[10px] font-body font-semibold uppercase tracking-[0.15em] transition-colors ${mode === 'login' ? 'bg-cream-light text-navy border-b-2 border-navy' : 'text-charcoal-soft hover:text-navy'}`}>Log In</button>
          <button onClick={() => switchMode('magic')} className={`flex-1 py-3 text-[10px] font-body font-semibold uppercase tracking-[0.15em] transition-colors ${mode === 'magic' ? 'bg-cream-light text-navy border-b-2 border-navy' : 'text-charcoal-soft hover:text-navy'}`}>Magic Link</button>
        </div>

        <div className="p-6 space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft">First Name</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 text-sm font-body bg-white-pure border border-slate-soft focus:border-navy outline-none rounded text-charcoal"
                placeholder="First Name"
              />
            </label>
          )}

          <label className="block">
            <span className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft">Email</span>
            <div className="mt-1 flex items-center border border-slate-soft bg-white-pure rounded focus-within:border-navy">
              <Mail size={14} className="ml-3 text-charcoal-muted" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); reset(); }}
                className="w-full px-2 py-2.5 text-sm font-body bg-transparent outline-none text-charcoal"
                placeholder="you@example.com"
              />
            </div>
          </label>

          {(mode === 'signup' || mode === 'login') && (
            <label className="block">
              <span className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft">
                Password {mode === 'signup' && <span className="text-charcoal-muted normal-case tracking-normal text-[10px]">(8+ characters)</span>}
              </span>
              <div className="mt-1 flex items-center border border-slate-soft bg-white-pure rounded focus-within:border-navy">
                <Lock size={14} className="ml-3 text-charcoal-muted" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); reset(); }}
                  className="w-full px-2 py-2.5 text-sm font-body bg-transparent outline-none text-charcoal"
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === 'Enter' && (mode === 'signup' ? handleSignUp() : handleLogin())}
                />
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-[10px] font-body text-slate-blue hover:text-navy mt-1.5 underline"
                >
                  Forgot password?
                </button>
              )}
            </label>
          )}

          {mode === 'signup' && (
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#434A60]"
              />
              <span className="text-xs font-body text-charcoal leading-relaxed">
                I agree to the{' '}
                <button type="button" onClick={onTermsClick} className="text-navy underline hover:text-charcoal">
                  Terms of Use
                </button>
                {' '}and understand this tool is for educational purposes only.
              </span>
            </label>
          )}

          {mode === 'reset' && (
            <p className="text-xs font-body text-charcoal-soft leading-relaxed bg-cream p-3 rounded">
              Enter the email tied to your account. We'll send you a link to set a new password.
              <button type="button" onClick={() => switchMode('login')} className="block text-navy underline hover:text-charcoal mt-1.5">
                Back to log in
              </button>
            </p>
          )}

          {error && <div className="text-xs text-negative font-body bg-rose-gold-soft p-2 rounded">{error}</div>}
          {info && <div className="text-xs text-positive font-body bg-cream p-2 rounded">{info}</div>}

          <button
            onClick={
              mode === 'signup' ? handleSignUp :
              mode === 'magic' ? handleMagicLink :
              mode === 'reset' ? handlePasswordReset :
              handleLogin
            }
            disabled={submitting}
            className="w-full py-2.5 font-body font-semibold uppercase tracking-[0.15em] text-[10px] bg-navy text-cream hover:bg-charcoal transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Working...' :
             mode === 'signup' ? 'Create Account' :
             mode === 'magic' ? 'Send Magic Link' :
             mode === 'reset' ? 'Send Reset Link' :
             'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedDeals = ({ open, onClose, deals, onLoad, onDelete }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-charcoal/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream-light border border-navy max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate">
          <div>
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Archive</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Saved Deals</h3>
          </div>
          <button onClick={onClose} className="text-charcoal hover:text-slate-blue transition-colors"><X size={18} strokeWidth={2} /></button>
        </div>
        <div className="overflow-y-auto">
          {deals.length === 0 ? (
            <div className="p-10 text-center font-body italic text-charcoal-muted text-sm">No saved deals yet. Save a deal to see it here.</div>
          ) : (
            deals.map(d => (
              <div key={d.id} className="flex items-center justify-between p-4 border-b border-cream-dark hover:bg-cream transition-colors">
                <div>
                  <div className="font-display text-xl text-navy">{d.name}</div>
                  <div className="text-[10px] font-body italic text-charcoal-muted mt-0.5">
                    {new Date(d.savedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onLoad(d)} className="px-3 py-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.12em] bg-navy text-cream hover:bg-charcoal transition-colors rounded">Load</button>
                  <button onClick={() => onDelete(d.id)} className="p-1.5 text-charcoal-muted hover:text-negative transition-colors"><Trash2 size={14} strokeWidth={1.5} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TermsModal = ({ open, onAccept, viewOnly, onClose }) => {
  const [agreed, setAgreed] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4">
      <div className="bg-cream-light border-2 border-navy max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col rounded shadow-2xl">
        <div className="p-6 border-b border-slate bg-navy">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-body uppercase tracking-[0.25em] text-slate-blue mb-1">Please Read</div>
              <h3 className="font-display text-3xl display-italic text-cream leading-none">Terms of Use</h3>
            </div>
            {viewOnly && <button onClick={onClose} className="text-cream hover:text-slate-blue transition-colors"><X size={20} strokeWidth={2} /></button>}
          </div>
        </div>

        <div className="overflow-y-auto p-6 font-body text-sm text-charcoal leading-relaxed space-y-4">
          <div className="p-4 bg-slate-soft border-l-4 border-navy rounded-r">
            <p className="font-semibold text-navy mb-1">Educational purpose only.</p>
            <p>This tool is provided for educational and illustrative purposes only. It is not professional financial, legal, tax, investment, real estate, or accounting advice, and must not be used as the basis for any actual transaction, investment, lending, or business decision. Outputs are estimates derived solely from the inputs you provide and do not constitute appraisals, valuations, underwriting determinations, market analyses, or recommendations of any kind. Any reliance on this tool is solely at your own risk.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">No professional relationship</h4>
            <p>Use of this tool does not create any advisor, broker, consultant, or fiduciary relationship between you and Acosta Development or Jenifer Acosta.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Your responsibility</h4>
            <p>You are responsible for verifying all inputs, assumptions, and outputs. Engage licensed professionals (attorneys, CPAs, underwriters, appraisers, real estate brokers) before making any real estate, financing, or investment decision.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">No warranty</h4>
            <p>This tool is provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, reliability, title, non-infringement, or that the tool will be uninterrupted, secure, or error-free. We make no representations regarding the accuracy of any calculation, projection, valuation, or result generated by the tool. You acknowledge that financial modeling involves inherent uncertainty and that actual results may differ materially from any projection produced here.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Limitation of liability</h4>
            <p>To the maximum extent permitted by law, in no event shall Acosta Development, Jenifer Acosta, or any of their affiliates, officers, employees, agents, or contractors be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including but not limited to lost profits, lost revenue, lost savings, loss of business opportunity, loss of goodwill, business interruption, failed transactions, financing shortfalls, or investment losses arising from or related to your use of this tool, even if advised of the possibility of such damages. Our total cumulative liability for any and all claims arising from or related to this tool, regardless of legal theory, shall not exceed the greater of the amount you paid us in the twelve months preceding the claim or one hundred U.S. dollars ($100). This limitation applies regardless of the form of action and survives termination of these Terms.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Indemnification</h4>
            <p>You agree to indemnify, defend, and hold harmless Acosta Development, Jenifer Acosta, and their officers, employees, contractors, and affiliates from and against any claims, damages, losses, liabilities, costs, or expenses (including reasonable attorneys' fees and court costs) arising from or related to: (a) your use or misuse of this tool; (b) your violation of these Terms of Use; (c) your reliance on any output, calculation, or information from this tool; (d) any decision you make based on this tool; or (e) your violation of any applicable law, regulation, or third-party right. This obligation survives your discontinued use of the tool.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Intellectual property</h4>
            <p>The tool, its code, design, and content are owned by Acosta Development. You may not copy, redistribute, or resell it without written permission.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Governing law</h4>
            <p>These terms are governed by the laws of the State of Michigan. Any disputes will be resolved in Midland County, Michigan.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Changes</h4>
            <p>We may update these terms at any time. Continued use means you accept the changes.</p>
          </div>

          <div className="pt-2 border-t border-cream-dark text-xs italic text-charcoal-muted">
            Last updated: May 2026. Questions: contact Acosta Development.
          </div>
        </div>

        {!viewOnly && (
          <div className="p-5 border-t border-slate bg-cream-light">
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#434A60]"
              />
              <span className="text-sm font-body text-charcoal">
                I have read and agree to the Terms of Use. I understand this tool is for educational purposes and I will consult licensed professionals before making financial decisions.
              </span>
            </label>
            <button
              onClick={onAccept}
              disabled={!agreed}
              className={`w-full py-3 font-body font-semibold uppercase tracking-[0.15em] text-sm rounded transition-all ${agreed ? 'bg-navy text-cream hover:bg-charcoal shadow-md' : 'bg-slate-soft text-charcoal-muted cursor-not-allowed'}`}
            >
              Accept &amp; Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PrivacyModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4">
      <div className="bg-cream-light border-2 border-navy max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col rounded shadow-2xl">
        <div className="p-6 border-b border-slate bg-navy">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-body uppercase tracking-[0.25em] text-slate-blue mb-1">How we handle your data</div>
              <h3 className="font-display text-3xl display-italic text-cream leading-none">Privacy Policy</h3>
            </div>
            <button onClick={onClose} className="text-cream hover:text-slate-blue transition-colors"><X size={20} strokeWidth={2} /></button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 font-body text-sm text-charcoal leading-relaxed space-y-4">
          <div className="p-4 bg-slate-soft border-l-4 border-navy rounded-r">
            <p className="font-semibold text-navy mb-1">In short.</p>
            <p>We collect the minimum information needed to run Deal Lab. We never sell your data. We use a small number of trusted service providers to operate the tool. You can delete your account at any time by contacting us.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">What we collect</h4>
            <p>When you use Deal Lab, we collect: your name, email address, and a hashed version of your password (for account creation and authentication); the deal data you choose to save (entered values and calculated outputs); records of your account activity (sign-ups, logins, payments, promo code redemptions); and basic technical data such as IP address and browser type for security and reliability purposes.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">How we use it</h4>
            <p>We use this information to provide and operate the Deal Lab service, authenticate your account, save and retrieve your deals across devices, process payments, send transactional emails (account confirmation, password reset, payment receipts), prevent abuse and fraud, and improve the tool over time. We do not use your data for advertising and we do not sell or rent your information to third parties.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Service providers we use</h4>
            <p>To operate Deal Lab, we share necessary information with the following providers:</p>
            <ul className="mt-2 space-y-1 text-charcoal-soft">
              <li>• <span className="font-semibold text-navy">Supabase</span>: account, authentication, and database hosting (your name, email, password hash, deals).</li>
              <li>• <span className="font-semibold text-navy">Stripe</span>: payment processing (your name, email, and payment details, which Stripe collects directly).</li>
              <li>• <span className="font-semibold text-navy">Resend</span>: transactional email delivery (your email address and message content).</li>
              <li>• <span className="font-semibold text-navy">Vercel</span>: web hosting and basic request logs (IP address, browser type).</li>
            </ul>
            <p className="mt-2">Each provider has its own privacy policy and security practices. We choose providers that meet reasonable industry standards.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Payment information</h4>
            <p>We do not store your full credit card number, expiration date, or CVV. All payments are processed by Stripe. We retain only a Stripe customer reference, the amount paid, and the timestamp of payment for record-keeping and refund support.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Cookies and tracking</h4>
            <p>We use a single authentication cookie or local storage entry to keep you signed in. We do not use third-party advertising trackers, behavioral tracking, or fingerprinting. Basic web hosting logs may include your IP address and browser type for security and operations.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Your choices</h4>
            <p>You may request to access, correct, or delete your account and personal data at any time by contacting us. Account deletion will permanently remove your saved deals, profile information, and authentication record. Some payment and audit records may be retained where required by law.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Data retention</h4>
            <p>We retain your account information and saved deals for as long as your account is active. If you delete your account, we delete the underlying data within a reasonable period, except where we are required to retain certain records (such as payment records) to comply with applicable laws.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Security</h4>
            <p>We use industry-standard practices including encrypted connections (HTTPS), encrypted password storage, and access controls on our database. No system is perfectly secure, however, and we cannot guarantee absolute security of any information transmitted over the internet.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Children</h4>
            <p>Deal Lab is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe a child has provided us with information, please contact us so we can remove it.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Changes to this policy</h4>
            <p>We may update this Privacy Policy from time to time. The "Last updated" date below indicates the most recent version. Material changes will be communicated through the app or by email to your account address.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Contact</h4>
            <p>For privacy questions, data requests, or account deletion, contact Acosta Development through the contact information available on jeniferacosta.com.</p>
          </div>

          <div className="pt-2 border-t border-cream-dark text-xs italic text-charcoal-muted">
            Last updated: May 2026.
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================
// PAYWALL HELPERS & COMPONENTS
// ============================================================

const TRIAL_DAYS = 7;

// Returns days remaining in trial (negative if expired)
const computeTrialStatus = (profile) => {
  if (!profile) return { daysRemaining: TRIAL_DAYS, isPaid: false, isExpired: false, isTrial: true };
  if (profile.paid) return { daysRemaining: 0, isPaid: true, isExpired: false, isTrial: false };

  const trialStart = new Date(profile.trial_started_at || profile.created_at || Date.now());
  const now = new Date();
  const elapsedMs = now - trialStart;
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays));
  const isExpired = elapsedDays >= TRIAL_DAYS;

  return { daysRemaining, isPaid: false, isExpired, isTrial: !isExpired };
};

const TrialBanner = ({ profile, onUpgrade }) => {
  const { daysRemaining, isPaid, isExpired } = computeTrialStatus(profile);
  if (isPaid) return null;

  const urgencyLevel = isExpired ? 'expired' : daysRemaining <= 2 ? 'urgent' : daysRemaining <= 4 ? 'warning' : 'info';
  const styles = {
    info: 'bg-cream-light border-slate-blue text-charcoal',
    warning: 'bg-cream-dark border-navy text-navy',
    urgent: 'bg-rose-gold-soft border-negative text-negative',
    expired: 'bg-negative text-cream',
  };
  const messages = {
    info: `${daysRemaining} days left in your free trial.`,
    warning: `Only ${daysRemaining} days left in your trial. Upgrade to keep access.`,
    urgent: `Trial ending soon: ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining.`,
    expired: `Your free trial has ended. Upgrade to continue using Deal Lab.`,
  };

  return (
    <div className={`px-4 md:px-8 py-2.5 border-b-2 ${styles[urgencyLevel]} flex items-center justify-between gap-3 flex-wrap`}>
      <div className="flex items-center gap-2 text-xs font-body">
        {urgencyLevel === 'expired' || urgencyLevel === 'urgent' ? <AlertCircle size={14} strokeWidth={2} /> : <Sparkles size={14} strokeWidth={1.5} />}
        <span className="font-semibold">{messages[urgencyLevel]}</span>
      </div>
      <button
        onClick={onUpgrade}
        className={`px-3 py-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.15em] rounded transition-colors ${
          urgencyLevel === 'expired'
            ? 'bg-cream text-negative hover:bg-white-pure'
            : 'bg-navy text-cream hover:bg-charcoal'
        }`}
      >
        Upgrade — $99 Lifetime
      </button>
    </div>
  );
};

const UpgradeModal = ({ open, onClose, session, onPromoSuccess }) => {
  const [view, setView] = useState('main'); // 'main' | 'promo'
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (!open) return null;

  const reset = () => { setError(''); setInfo(''); };

  const handlePay = async () => {
    reset();
    setSubmitting(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start checkout');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e.message || 'Could not start checkout');
      setSubmitting(false);
    }
  };

  const handleRedeemPromo = async () => {
    reset();
    if (!promoCode.trim()) return setError('Enter a code');
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('redeem_promo_code', { p_code: promoCode.trim() });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Could not redeem code');

      if (data.type === 'free') {
        setInfo('Code accepted. Lifetime access unlocked!');
        setTimeout(() => {
          onPromoSuccess();
          onClose();
        }, 1200);
      } else {
        setInfo(`${data.discount_percent}% off applied. Continue to checkout.`);
        // For percent_off, transition to Stripe checkout
        setTimeout(() => handlePay(), 800);
      }
    } catch (e) {
      setError(e.message || 'Invalid or expired code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream-light border-2 border-navy max-w-md w-full overflow-hidden rounded shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 bg-navy">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-body uppercase tracking-[0.25em] text-slate-blue">Lifetime Access</div>
            <button onClick={onClose} className="text-slate-blue hover:text-cream"><X size={16} strokeWidth={2} /></button>
          </div>
          <h3 className="font-display text-3xl display-italic text-cream leading-none">Unlock Deal Lab</h3>
        </div>

        <div className="p-6 space-y-4">
          {view === 'main' && (
            <>
              <div className="text-sm font-body text-charcoal leading-relaxed space-y-2">
                <p>One payment. Lifetime access. No subscriptions.</p>
                <ul className="space-y-1 text-charcoal-soft">
                  <li>• All four calculators (For Rent, For Sale, Gap Financing, Comparison)</li>
                  <li>• Save unlimited deals across any device</li>
                  <li>• All future updates included</li>
                </ul>
              </div>

              <div className="flex items-baseline gap-2 py-3 border-y border-cream-dark">
                <span className="font-display text-4xl display-italic text-navy">$99</span>
                <span className="text-xs font-body italic text-charcoal-muted">one-time, lifetime</span>
              </div>

              {error && <div className="text-xs text-negative font-body bg-rose-gold-soft p-2 rounded">{error}</div>}

              <button
                onClick={handlePay}
                disabled={submitting}
                className="w-full py-3 font-body font-semibold uppercase tracking-[0.15em] text-[10px] bg-navy text-cream hover:bg-charcoal transition-colors rounded disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard size={13} strokeWidth={2} />
                {submitting ? 'Loading checkout...' : 'Pay $99 — Lifetime Access'}
              </button>

              <button
                onClick={() => { setView('promo'); reset(); }}
                className="w-full text-[10px] font-body uppercase tracking-[0.15em] text-slate-blue hover:text-navy transition-colors flex items-center justify-center gap-1"
              >
                <Tag size={11} strokeWidth={2} /> Have a promo code?
              </button>
            </>
          )}

          {view === 'promo' && (
            <>
              <div className="text-sm font-body text-charcoal leading-relaxed">
                Enter your promo code to unlock access or get a discount.
              </div>

              <input
                type="text"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); reset(); }}
                placeholder="ENTER CODE"
                className="w-full px-3 py-2.5 text-sm font-mono text-center uppercase tracking-[0.2em] bg-white-pure border border-slate-soft focus:border-navy outline-none rounded text-charcoal"
                onKeyDown={(e) => e.key === 'Enter' && handleRedeemPromo()}
              />

              {error && <div className="text-xs text-negative font-body bg-rose-gold-soft p-2 rounded">{error}</div>}
              {info && <div className="text-xs text-positive font-body bg-cream p-2 rounded">{info}</div>}

              <button
                onClick={handleRedeemPromo}
                disabled={submitting}
                className="w-full py-2.5 font-body font-semibold uppercase tracking-[0.15em] text-[10px] bg-navy text-cream hover:bg-charcoal transition-colors rounded disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Redeem Code'}
              </button>

              <button
                onClick={() => { setView('main'); reset(); setPromoCode(''); }}
                className="w-full text-[10px] font-body uppercase tracking-[0.15em] text-slate-blue hover:text-navy transition-colors"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export default function HousingFinanceApp() {
  // Auth state
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // App state
  const [tab, setTab] = useState('rent');
  const [rent, setRent] = useState(defaultRent);
  const [sale, setSale] = useState(defaultSale);
  const [gap, setGap] = useState(defaultGap);
  const [comp, setComp] = useState(defaultComp);
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [dealName, setDealName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [showTermsView, setShowTermsView] = useState(false);
  const [showPrivacyView, setShowPrivacyView] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const rentResults = useMemo(() => calcRent(rent), [rent]);
  const saleResults = useMemo(() => calcSale(sale), [sale]);
  const gapResults = useMemo(() => calcGap(gap), [gap]);
  const compResults = useMemo(() => calcComparison(rent, sale, comp), [rent, sale, comp]);

  // Listen to auth state changes
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Handle Stripe redirect: ?payment=success after a successful checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && session?.user) {
      // Poll profile every 2 seconds for up to 30 seconds to catch the webhook update
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(async () => {
        attempts++;
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (data?.paid) {
          setProfile(data);
          clearInterval(interval);
          // Clean up the URL
          window.history.replaceState({}, '', window.location.pathname);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // When user logs in, fetch their profile and deals from Supabase
  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setDeals([]);
      return;
    }

    const userId = session.user.id;

    (async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      } else {
        // First magic-link login: create a profile if one didn't exist
        const newProfile = {
          id: userId,
          email: session.user.email,
          first_name: session.user.user_metadata?.first_name || '',
          terms_accepted_at: new Date().toISOString(),
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }

      // Fetch deals
      setDealsLoading(true);
      const { data: dealsData } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dealsData) {
        // Map DB shape to app shape
        const mapped = dealsData.map(d => ({
          id: d.id,
          name: d.name,
          savedAt: d.created_at,
          rent: d.rent,
          sale: d.sale,
          gap: d.gap,
          comp: d.comp,
        }));
        setDeals(mapped);
      }
      setDealsLoading(false);

      // One-time migration: if user has localStorage deals, copy them to Supabase
      try {
        const localDeals = localStorage.getItem('dealLab:deals');
        const migrated = localStorage.getItem('dealLab:migratedToSupabase');
        if (localDeals && !migrated) {
          const parsed = JSON.parse(localDeals);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const rows = parsed.map(d => ({
              user_id: userId,
              name: d.name,
              rent: d.rent || null,
              sale: d.sale || null,
              gap: d.gap || null,
              comp: d.comp || null,
            }));
            await supabase.from('deals').insert(rows);
            localStorage.setItem('dealLab:migratedToSupabase', 'true');
            // Re-fetch
            const { data: refreshed } = await supabase
              .from('deals')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            if (refreshed) {
              setDeals(refreshed.map(d => ({
                id: d.id,
                name: d.name,
                savedAt: d.created_at,
                rent: d.rent,
                sale: d.sale,
                gap: d.gap,
                comp: d.comp,
              })));
            }
          }
        }
      } catch (e) { /* noop */ }
    })();
  }, [session]);

  const saveDeal = async () => {
    if (!dealName.trim()) {
      setSaveStatus('Enter a deal name');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    if (!session?.user) {
      setSaveStatus('Not signed in');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    // Paywall: block save if trial expired and not paid
    const status = computeTrialStatus(profile);
    if (status.isExpired && !status.isPaid) {
      setShowUpgrade(true);
      return;
    }
    setSaveStatus('Saving...');
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          user_id: session.user.id,
          name: dealName.trim(),
          rent, sale, gap, comp,
        })
        .select()
        .single();

      if (error) throw error;

      const newDeal = {
        id: data.id,
        name: data.name,
        savedAt: data.created_at,
        rent: data.rent,
        sale: data.sale,
        gap: data.gap,
        comp: data.comp,
      };
      setDeals([newDeal, ...deals]);
      setDealName('');
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const loadDeal = (deal) => {
    const migrateRent = (r) => {
      if (!r) return defaultRent;
      if (r.unitTypes) return { ...defaultRent, ...r };
      return {
        ...defaultRent,
        purchasePrice: r.purchasePrice || 0,
        constructionMode: 'total',
        constructionTotal: r.rehab || 0,
        closingCostsPct: (r.closingCosts && r.purchasePrice) ? (r.closingCosts / (r.purchasePrice + (r.rehab || 0)) * 100) : 3,
        unitTypes: [{ id: 1, label: 'Unit', count: r.units || 1, sizeSqft: 0, rentMonthly: r.grossMonthlyRent || 0 }],
        otherIncomeMonthly: r.otherIncomeMonthly || 0,
        vacancyPct: r.vacancyPct ?? 5,
        taxesAnnual: r.taxesAnnual || 0,
        insuranceAnnual: r.insuranceAnnual || 0,
        pmPctOfEGI: r.pmPctOfEGI ?? 8,
        maintenancePctOfEGI: r.maintenancePctOfEGI ?? 5,
        reservesPerUnit: r.reservesPerUnit ?? 300,
        utilitiesAnnual: r.utilitiesAnnual || 0,
        otherOpexAnnual: r.otherOpexAnnual || 0,
        ltvPct: r.ltvPct ?? 75,
        ratePct: r.ratePct ?? 6.5,
        amortYears: r.amortYears ?? 20,
        loanTerm: r.loanTerm ?? 5,
      };
    };
    const migrateSale = (s) => {
      if (!s) return defaultSale;
      if (s.unitTypes) return { ...defaultSale, ...s };
      return {
        ...defaultSale,
        landCost: s.landCost || 0,
        hardCostsMode: 'total',
        hardCostsTotal: s.hardCosts || 0,
        softCostsPct: s.softCostsPct ?? 20,
        financingCostsPct: s.financingCostsPct ?? 5,
        contingencyPct: s.contingencyPct ?? 10,
        devFeePct: s.devFeePct ?? 0,
        saleCostsPct: s.saleCostsPct ?? 6,
        unitTypes: [{ id: 1, label: 'Unit', count: s.units || 1, sizeSqft: 0, salePrice: s.salePricePerUnit || 0 }],
      };
    };

    if (deal.rent) setRent(migrateRent(deal.rent));
    if (deal.sale) setSale(migrateSale(deal.sale));
    if (deal.gap) setGap({ ...defaultGap, ...deal.gap });
    if (deal.comp) setComp({ ...defaultComp, ...deal.comp });
    setDealName(deal.name);
    setShowDeals(false);
  };

  const deleteDeal = async (id) => {
    setDeals(deals.filter(d => d.id !== id));
    try {
      await supabase.from('deals').delete().eq('id', id);
    } catch (e) { /* noop */ }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setRent(defaultRent);
    setSale(defaultSale);
    setGap(defaultGap);
    setComp(defaultComp);
    setDealName('');
  };

  const tabs = [
    { id: 'rent', label: 'For Rent', icon: Home },
    { id: 'sale', label: 'For Sale', icon: Building2 },
    { id: 'gap', label: 'Gap Financing', icon: Layers },
    { id: 'compare', label: 'Rent vs Sale', icon: GitCompare },
  ];

  useEffect(() => {
    if (saleResults.tdc > 0 && gap.tdc === 0) {
      setGap(g => ({ ...g, tdc: saleResults.tdc }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleResults.tdc]);

  // Loading screen while checking auth
  if (authLoading) {
    return (
      <div className="paper-bg min-h-screen flex items-center justify-center">
        <GlobalStyles />
        <div className="font-display display-italic text-2xl text-navy">Loading...</div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!session) {
    return (
      <>
        <AuthScreen onTermsClick={() => setShowTermsView(true)} />
        <TermsModal open={showTermsView} viewOnly onClose={() => setShowTermsView(false)} />
      </>
    );
  }

  // Main app for authenticated users
  return (
    <div className="paper-bg min-h-screen font-body text-charcoal">
      <GlobalStyles />

      <TrialBanner profile={profile} onUpgrade={() => setShowUpgrade(true)} />

      <header className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="text-[10px] font-body uppercase tracking-[0.3em] text-slate-blue mb-2">Acosta Development</div>
            <h1 className="font-display text-5xl md:text-6xl text-cream leading-none">
              <span className="display-italic">Deal</span> <span>Lab</span>
            </h1>
            <div className="text-xs font-body italic text-slate-blue mt-3 tracking-wide">
              {profile?.first_name ? `Welcome back, ${profile.first_name}.` : 'Housing finance calculators for sale, rent, and gap analysis.'}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="Deal name"
              className="px-3 py-2 text-sm font-body bg-cream-light border border-slate-soft focus:border-navy outline-none transition-colors rounded text-charcoal"
            />
            <button onClick={saveDeal} className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-body font-semibold uppercase tracking-[0.15em] bg-cream text-navy hover:bg-white-pure transition-colors rounded shadow-sm">
              <Save size={12} strokeWidth={2} /> {saveStatus || 'Save'}
            </button>
            <button onClick={() => setShowDeals(true)} className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-body font-semibold uppercase tracking-[0.15em] border border-cream text-cream hover:bg-cream hover:text-navy transition-colors rounded">
              <FolderOpen size={12} strokeWidth={2} /> Load
            </button>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-slate-blue hover:text-cream transition-colors rounded" title="Sign out">
              <LogOut size={12} strokeWidth={2} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate bg-cream-light sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 text-[10px] font-body font-semibold uppercase tracking-[0.18em] border-b-2 transition-all whitespace-nowrap ${active ? 'border-navy text-navy' : 'border-transparent text-charcoal-soft hover:text-navy'}`}
              >
                <Icon size={13} strokeWidth={1.5} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {tab === 'rent' && <RentCalculator data={rent} setData={setRent} results={rentResults} />}
        {tab === 'sale' && <SaleCalculator data={sale} setData={setSale} results={saleResults} />}
        {tab === 'gap' && <GapCalculator data={gap} setData={setGap} results={gapResults} />}
        {tab === 'compare' && <ComparisonView rent={rent} sale={sale} comp={comp} setComp={setComp} results={compResults} />}
      </main>

      <footer className="border-t border-slate bg-cream-light mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[10px] font-body italic text-charcoal-muted">
            <span>© 2026 Jenifer Acosta / Acosta Development. All rights reserved.</span>
            <span className="hidden md:inline text-slate-blue">•</span>
            <span>For educational purposes only. Validate with full underwriting.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowTermsView(true)} className="flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-navy hover:text-slate-blue transition-colors">
              <FileText size={11} strokeWidth={1.5} /> Terms of Use
            </button>
            <button onClick={() => setShowPrivacyView(true)} className="flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-navy hover:text-slate-blue transition-colors">
              <FileText size={11} strokeWidth={1.5} /> Privacy
            </button>
            <span className="text-[10px] font-body text-charcoal-muted">v2.1</span>
          </div>
        </div>
      </footer>

      <SavedDeals open={showDeals} onClose={() => setShowDeals(false)} deals={deals} onLoad={loadDeal} onDelete={deleteDeal} loading={dealsLoading} />
      <TermsModal open={showTermsView} viewOnly onClose={() => setShowTermsView(false)} />
      <PrivacyModal open={showPrivacyView} onClose={() => setShowPrivacyView(false)} />
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        session={session}
        onPromoSuccess={async () => {
          // Re-fetch profile to pick up the new paid status
          if (session?.user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            if (data) setProfile(data);
          }
        }}
      />
    </div>
  );
}
