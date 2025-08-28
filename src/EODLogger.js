import React, { useState } from 'react';
import './App.css';

const reps = ['AA8', 'DN', 'YK', 'HK4', 'MR5', 'Other'];

const productsByType = {
  CBU: ['CBU BYOD', 'CBU TERM', 'CBU HUP', 'CBU TVM HUP', 'CBU HUP RD', 'CBU TVM HUP RD'],
  RPP: ['RPP BYOD', 'RPP TERM', 'RPP HUP', 'RPP TVM HUP', 'RPP HUP RD', 'RPP TVM HUP RD'],
  SMB: ['SMB BYOD', 'SMB TERM', 'SMB HUP', 'SMB TVM HUP', 'SMB HUP RD', 'SMB TVM HUP RD'],
  None: [
    'DP', 'EXPU_H', 'EXPU_V', 'MBB NAC', 'MBB HUP', 'MC APPROVED',
    'MC UNDERREVIEW', 'ACC', 'CABLE', '5GHI', 'CHATR', 'OUTRIGHT SALE'
  ]
};

function App() {
  const [repData, setRepData] = useState([{ rep: '', products: [], selectedTypes: [] }]);
  const [showDisplay, setShowDisplay] = useState(false);
  const [displayText, setDisplayText] = useState('');

  const handleRepChange = (index, value) => {
    const newData = [...repData];
    newData[index].rep = value === 'Other' ? '' : value;
    newData[index].products = [];
    newData[index].selectedTypes = [];
    setRepData(newData);
  };

  const handleOtherRepChange = (index, value) => {
    const newData = [...repData];
    newData[index].rep = value.toUpperCase();
    setRepData(newData);
  };

  const handleProductQtyChange = (repIndex, product, qty) => {
    const newData = [...repData];
    const rep = newData[repIndex];
    const existing = rep.products.find(p => p.name === product);
    if (existing) {
      existing.qty = qty;
    } else {
      rep.products.push({ name: product, qty });
    }
    setRepData(newData);
  };

  const getProductsForRep = (repIndex, type) => {
    const rep = repData[repIndex];
    return rep.products.filter(p => productsByType[type]?.includes(p.name));
  };

  const handleCustomerTypeClick = (repIndex, type) => {
    const newData = [...repData];
    const rep = newData[repIndex];
    if (rep.selectedTypes.includes(type)) return; // Prevent duplicates
    rep.selectedTypes.push(type);
    const selectedProducts = productsByType[type];
    selectedProducts.forEach(product => {
      if (!rep.products.find(p => p.name === product)) {
        rep.products.push({ name: product, qty: 0 });
      }
    });
    setRepData(newData);
  };

  const addRep = () => {
    setRepData([...repData, { rep: '', products: [], selectedTypes: [] }]);
  };

  const clearAll = () => {
    setRepData([{ rep: '', products: [], selectedTypes: [] }]);
    setShowDisplay(false);
    setDisplayText('');
  };

  const displaySummary = () => {
    const today = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });
    let summary = `${today}\n\n`;
    repData.forEach(rep => {
      const filtered = rep.products.filter(p => p.qty > 0);
      if (rep.rep && filtered.length > 0) {
        summary += `${rep.rep.toUpperCase()}: ` + filtered.map(p => `${p.qty} ${p.name}`).join(', ') + `\n\n`;
      }
    });
    setDisplayText(summary.trim());
    setShowDisplay(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = displayText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Arial' }}>
      {!showDisplay && repData.map((rep, index) => (
        <div key={index} style={{ marginBottom: '3rem', border: '1px solid #ccc', padding: '1.5rem', borderRadius: '10px', display: 'inline-block', minWidth: '300px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <select value={rep.rep || 'Select Rep'} onChange={e => handleRepChange(index, e.target.value)} style={{ fontSize: '1rem', padding: '0.5rem', marginBottom: '1rem' }}>
              <option disabled>Select Rep</option>
              {reps.map(r => <option key={r}>{r}</option>)}
            </select>
            {rep.rep === '' && (
              <input type="text" placeholder="Enter Rep Code" value={rep.rep} onChange={e => handleOtherRepChange(index, e.target.value)} style={{ textTransform: 'uppercase', fontSize: '1rem', padding: '0.5rem' }} />
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            {['CBU', 'RPP', 'SMB', 'None'].map(type => (
              <button
                key={type}
                onClick={() => handleCustomerTypeClick(index, type)}
                disabled={rep.selectedTypes.includes(type)}
                style={{ margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>
                {type}
              </button>
            ))}
          </div>

          {rep.selectedTypes.map(type => (
            <div key={type}>
              <h4>{type} Products</h4>
              {getProductsForRep(index, type).map(product => (
                <div key={product.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ marginRight: '1rem', minWidth: '120px', textAlign: 'right' }}>{product.name}</span>
                  <button onClick={() => handleProductQtyChange(index, product.name, Math.max(0, product.qty - 1))} style={{ margin: '0 0.5rem' }}>-</button>
                  <span>{product.qty}</span>
                  <button onClick={() => handleProductQtyChange(index, product.name, product.qty + 1)} style={{ margin: '0 0.5rem' }}>+</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {!showDisplay && (
        <div style={{ marginTop: '2rem' }}>
          <button onClick={addRep} style={{ margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>Add Rep</button>
          <button onClick={displaySummary} style={{ margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>Display</button>
          <button onClick={clearAll} style={{ margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>Clear All</button>
        </div>
      )}

      {showDisplay && (
        <div style={{ padding: '2rem' }}>
          <textarea value={displayText} readOnly style={{ width: '90vw', height: '80vh', fontSize: '1.2rem', padding: '1rem' }} />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={copyToClipboard} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>Copy</button>
            <button onClick={() => setShowDisplay(false)} style={{ padding: '0.5rem 1rem', marginLeft: '1rem', fontSize: '1rem' }}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;