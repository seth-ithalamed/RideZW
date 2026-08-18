import React, { useState } from 'react';
import {
  Code,
  Shield,
  Layers,
  ArrowRight,
  Server,
  Smartphone,
  Building2,
  Lock,
  Zap,
  CheckCircle,
  Copy,
  Terminal,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Currency, Language } from '../../types';

interface ArchitectureDocsProps {
  currency: Currency;
  language: Language;
}

export const ArchitectureDocs: React.FC<ArchitectureDocsProps> = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlLookupSnippet = `curl -X GET "https://registry.transport.gov.zw/api/v1/permits/status?plate=AFC-4921" \\
  -H "Authorization: Bearer rzw_live_key_99214a" \\
  -H "X-Platform-ID: ridezw-operator-01"`;

  const webhookPayloadSnippet = `{
  "event": "permit.suspended",
  "permit_number": "ZW-MOT-2026-0422",
  "national_id": "63-9941021-T19",
  "driver_name": "Farai Ndlovu",
  "vehicle_plate": "AGB-1102",
  "reason": "Lapsed Third Party PSV Insurance policy",
  "action_required": "Immediate dispatch block on all e-hailing platforms",
  "timestamp": "2026-08-16T14:30:00Z"
}`;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Title & Introduction */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-slate-900 font-bold text-xs">Technical Specification & Separation Matrix</h2>
            <p className="text-[10px] text-slate-500">
              RideZW Bilateral Negotiation Protocol, Zimbabwean E-Hailing Compliance, and Authority Separation Matrix
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          RideZW enforces an authoritative, decoupled separation of concerns between private e-hailing operations (fare negotiation, dispatch, in-app messaging) and the statutory Government Operations Permit Registry (compliance, suspensions, roadside inspections).
        </p>
      </div>

      {/* 1. SEPARATION OF CONCERNS & WRITE AUTHORITY */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <h3 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-sky-800" />
          <span>1. Separation of Concerns & State Authority Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-800" />
              <strong className="text-slate-900">Government Registry Node (Independent Write)</strong>
            </div>
            <p className="text-slate-600 text-[11px]">
              Exclusive write authority over driver permits, suspension orders, vehicle fitness inspection results, and statutory revenue collection.
            </p>
            <div className="text-[10px] font-mono text-emerald-700 font-bold">
              AUTH: Ministry of Transport & ID Compliance
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-800" />
              <strong className="text-slate-900">RideZW Platform & Fleet Nodes (Read & Gating)</strong>
            </div>
            <p className="text-slate-600 text-[11px]">
              Consumes permit status via read-only REST APIs. Operational policy allows drivers to operate freely, with optional statutory compliance verification.
            </p>
            <div className="text-[10px] font-mono text-sky-800 font-bold">
              INTEGRATIONS: RideZW Core, Corporate Gateways, Logistics Fleets
            </div>
          </div>
        </div>
      </div>

      {/* 2. REGULATORY STATUS VERIFICATION API */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>2. Real-Time Permit Status Verification API</span>
          </h3>
          <button
            onClick={() => copyToClipboard(curlLookupSnippet, 'curl')}
            className="flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-800"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedSection === 'curl' ? 'COPIED' : 'COPY CURL'}</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto border border-slate-800">
          {curlLookupSnippet}
        </pre>
      </div>

      {/* 3. ASYNC SUSPENSION WEBHOOK NOTIFICATION */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>3. Cross-Platform Suspension Webhook Stream</span>
          </h3>
          <button
            onClick={() => copyToClipboard(webhookPayloadSnippet, 'webhook')}
            className="flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-800"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedSection === 'webhook' ? 'COPIED' : 'COPY JSON'}</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto border border-slate-800">
          {webhookPayloadSnippet}
        </pre>
      </div>
    </div>
  );
};
