export default function Filters({ options, values, onChange }) {
  if (!options) return null;

  function update(field, value) {
    onChange({ ...values, [field]: value });
  }

  function toggleIntolerance(value) {
    const current = values.intolerances || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update('intolerances', next);
  }

  return (
    <div className="filters">
      <div className="filter-field">
        <label htmlFor="cuisine">Culinária</label>
        <select id="cuisine" value={values.cuisine} onChange={(e) => update('cuisine', e.target.value)}>
          <option value="">Qualquer</option>
          {options.cuisines.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="diet">Dieta</label>
        <select id="diet" value={values.diet} onChange={(e) => update('diet', e.target.value)}>
          <option value="">Qualquer</option>
          {options.diets.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="tempo">Tempo de preparo</label>
        <select id="tempo" value={values.tempo} onChange={(e) => update('tempo', e.target.value)}>
          <option value="">Qualquer</option>
          {options.timeRanges.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="dificuldade">Dificuldade</label>
        <select
          id="dificuldade"
          value={values.dificuldade}
          onChange={(e) => update('dificuldade', e.target.value)}
        >
          <option value="">Qualquer</option>
          {options.difficulties.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field filter-field-checkboxes">
        <span className="filter-label">Restrições</span>
        {options.intolerances.map((i) => (
          <label key={i.value} className="checkbox-label">
            <input
              type="checkbox"
              checked={(values.intolerances || []).includes(i.value)}
              onChange={() => toggleIntolerance(i.value)}
            />
            {i.label}
          </label>
        ))}
      </div>
    </div>
  );
}
