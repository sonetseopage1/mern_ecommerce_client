'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useLang } from '@/lib/hooks';

// Division → District → Thana / Upazila selector. Calls onChange({ division, district, upazila }) with the chosen area objects.
export default function AreaSelect({ value, onChange }) {
  const { t, lang } = useLang();
  const [divs, setDivs] = useState([]);
  const [dists, setDists] = useState([]);
  const [ups, setUps] = useState([]);
  const nm = (a) => (lang === 'bn' ? a.bn || a.name : a.name);

  useEffect(() => { api.get('/geo/divisions').then((r) => setDivs(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (value.division) api.get(`/geo/districts?division=${value.division.id}`).then((r) => setDists(r.data)); else setDists([]); }, [value.division]);
  useEffect(() => { if (value.district) api.get(`/geo/upazilas?district=${value.district.id}`).then((r) => setUps(r.data)); else setUps([]); }, [value.district]);

  const pick = (list, id) => list.find((x) => x.id === id) || null;
  const sel = 'input';
  // thanas of the city corporations first, then upazilas
  const thanas = ups.filter((u) => u.kind === 'thana'), upazilas = ups.filter((u) => u.kind !== 'thana');

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="label">{t('division')} *</label>
        <select required className={sel} value={value.division?.id || ''} onChange={(e) => onChange({ division: pick(divs, e.target.value), district: null, upazila: null })}>
          <option value="">{t('selectDivision')}</option>{divs.map((d) => <option key={d.id} value={d.id}>{nm(d)}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('district')} *</label>
        <select required disabled={!value.division} className={sel} value={value.district?.id || ''} onChange={(e) => onChange({ ...value, district: pick(dists, e.target.value), upazila: null })}>
          <option value="">{t('selectDistrict')}</option>{dists.map((d) => <option key={d.id} value={d.id}>{nm(d)}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('thana')} *</label>
        <select required disabled={!value.district} className={sel} value={value.upazila?.id || ''} onChange={(e) => onChange({ ...value, upazila: pick(ups, e.target.value) })}>
          <option value="">{t('selectThana')}</option>
          {thanas.length > 0 && <optgroup label={lang === 'bn' ? 'সিটি এলাকা (থানা)' : 'City areas (thana)'}>{thanas.map((u) => <option key={u.id} value={u.id}>{nm(u)}</option>)}</optgroup>}
          {upazilas.length > 0 && (thanas.length > 0
            ? <optgroup label={lang === 'bn' ? 'উপজেলা' : 'Upazila'}>{upazilas.map((u) => <option key={u.id} value={u.id}>{nm(u)}</option>)}</optgroup>
            : upazilas.map((u) => <option key={u.id} value={u.id}>{nm(u)}</option>))}
        </select>
      </div>
    </div>
  );
}
