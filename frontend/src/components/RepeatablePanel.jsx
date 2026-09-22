import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { SCHEMAS, NEW_ITEM_DEFAULTS } from '../schemas';

export default function RepeatablePanel({ schemaKey }) {
  const schema = SCHEMAS[schemaKey];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.list(schema.resource).then(setItems).finally(() => setLoading(false));
  }, [schema.resource]);

  function updateLocal(id, field, value) {
    setItems((prev) => prev.map((it) => (it[schema.idField] === id ? { ...it, [field]: value } : it)));
  }

  async function persistField(id, field, value) {
    try {
      const updated = await api.update(schema.resource, id, { [field]: value });
      setItems((prev) => prev.map((it) => (it[schema.idField] === id ? updated : it)));
    } catch (err) {
      console.error(err);
    }
  }

  async function addItem() {
    const created = await api.create(schema.resource, NEW_ITEM_DEFAULTS[schemaKey]);
    setItems((prev) => [...prev, created]);
  }

  async function removeItem(id) {
    await api.remove(schema.resource, id);
    setItems((prev) => prev.filter((it) => it[schema.idField] !== id));
  }

  if (loading) return <div className="empty-note">Loading…</div>;

  return (
    <div>
      <div className="panel-head">
        <h2>{schema.title}</h2>
        <p>{schema.desc}</p>
      </div>
      {items.length === 0 && <div className="empty-note">{schema.empty}</div>}
      {items.map((item) => (
        <Card key={item[schema.idField]} schema={schema} item={item} onChange={updateLocal} onBlurField={persistField} onRemove={() => removeItem(item[schema.idField])} />
      ))}
      <button className="add-btn" onClick={addItem}>+ Add {schema.title.replace(/s$/, '').toLowerCase()}</button>
    </div>
  );
}

function Card({ schema, item, onChange, onBlurField, onRemove }) {
  const grid = schema.fields.some((f) => f.half);
  return (
    <div className="card-form">
      <div className="card-form-head">
        <span className="badge">{schema.summary(item)}</span>
        <button className="remove-btn" onClick={onRemove}>Remove</button>
      </div>
      <div className={grid ? 'field-grid cols-2' : ''}>
        {schema.fields.map((f) => (
          <Field key={f.name} field={f} item={item} idField={schema.idField} onChange={onChange} onBlurField={onBlurField} />
        ))}
      </div>
    </div>
  );
}

function Field({ field: f, item, idField, onChange, onBlurField }) {
  const id = item[idField];
  const spanFull = !f.half ? { gridColumn: '1 / -1' } : undefined;
  const val = item[f.name];

  if (f.type === 'checkbox') {
    return (
      <div className="field-row" style={spanFull}>
        <label className="check-row">
          <input
            type="checkbox"
            checked={!!val}
            onChange={(e) => { onChange(id, f.name, e.target.checked); onBlurField(id, f.name, e.target.checked); }}
          />
          {f.label}
        </label>
      </div>
    );
  }
  if (f.type === 'textarea') {
    return (
      <div className="field-row" style={spanFull}>
        <label>{f.label}</label>
        <textarea
          defaultValue={val || ''} placeholder={f.placeholder || ''}
          onChange={(e) => onChange(id, f.name, e.target.value)}
          onBlur={(e) => onBlurField(id, f.name, e.target.value)}
        />
      </div>
    );
  }
  if (f.type === 'select') {
    return (
      <div className="field-row" style={spanFull}>
        <label>{f.label}</label>
        <select value={val || f.options[0]} onChange={(e) => { onChange(id, f.name, e.target.value); onBlurField(id, f.name, e.target.value); }}>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  const disabled = f.disabledIf && item[f.disabledIf];
  return (
    <div className="field-row" style={spanFull}>
      <label>{f.label}</label>
      <input
        type={f.type} disabled={disabled} placeholder={f.placeholder || ''}
        defaultValue={val || ''}
        onChange={(e) => onChange(id, f.name, e.target.value)}
        onBlur={(e) => onBlurField(id, f.name, e.target.value)}
      />
    </div>
  );
}
