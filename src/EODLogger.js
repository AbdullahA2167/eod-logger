import React, { useState } from 'react';

const reps = ['AA8', 'DN', 'MR5', 'YK', 'Other'];

const productsByType = {
  CBU: ['CBU VOICE', 'CBU TERM', 'CBU HUP', 'CBU TVM HUP', 'CBU HUP RD', 'CBU TVM HUP RD', 'CBU 5GHI', 'CBU MBB'],
  RPP: ['RPP VOICE', 'RPP TERM', 'RPP HUP', 'RPP TVM HUP', 'RPP HUP RD', 'RPP TVM HUP RD', 'RPP 5GHI', 'RPP MBB'],
  SMB: ['SMB VOICE', 'SMB TERM', 'SMB HUP', 'SMB TVM HUP', 'SMB HUP RD', 'SMB TVM HUP RD', 'SMB 5GHI', 'SMB MBB', 'SMB CABLE'],
  FIDO: ['FIDO VOICE', 'FIDO TERM', 'FIDO HUP', 'FIDO TVM HUP', 'FIDO HUP RD', 'FIDO TVM HUP RD', 'FIDO MBB', 'FIDO EXPU_N', 'FIDO EXPU_H', 'FIDO EXPU_V'],
  Other: [
    'DP', 'ACC', 'EXPU_N', 'EXPU_H', 'EXPU_V', 'MC APPROVED',
    'MC UNDERREVIEW', 'CABLE', 'CHATR', 'OUTRIGHT SALE', 'COMWAVE'
  ]
};

export default function EODLogger() {
  const [repData, setRepData] = useState([
    { rep: '', products: [], selectedTypes: [], customProducts: [], accProfit: '' }
  ]);
  const [showDisplay, setShowDisplay] = useState(false);
  const [displayText, setDisplayText] = useState('');

  const handleRepChange = (index, value) => {
    const newData = [...repData];
    newData[index] = {
      rep: value === 'Other' ? '' : value,
      products: [],
      selectedTypes: [],
      customProducts: [],
      accProfit: ''
    };
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

  const handleCustomProductChange = (index, name, qty) => {
    if (!name) return;
    const newData = [...repData];
    const rep = newData[index];
    const existing = rep.customProducts.find(p => p.name === name);
    if (existing) {
      existing.qty = qty;
    } else {
      rep.customProducts.push({ name, qty });
    }
    setRepData(newData);
  };

  const handleAccProfitChange = (index, value) => {
    const newData = [...repData];
    newData[index].accProfit = value;
    setRepData(newData);
  };

  const getProductsForRep = (repIndex, type) => {
    const rep = repData[repIndex];
    return rep.products.filter(p => productsByType[type]?.includes(p.name));
  };

  const handleCustomerTypeClick = (repIndex, type) => {
    if (!repData[repIndex].rep) return;

    const newData = [...repData];
    const rep = newData[repIndex];

    if (rep.selectedTypes.includes(type)) return;

    rep.selectedTypes.push(type);

    productsByType[type].forEach(product => {
      if (!rep.products.find(p => p.name === product)) {
        rep.products.push({ name: product, qty: 0 });
      }
    });

    setRepData(newData);
  };

  const addRep = () => {
    setRepData([
      ...repData,
      { rep: '', products: [], selectedTypes: [], customProducts: [], accProfit: '' }
    ]);
  };

  const clearAll = () => {
    setRepData([
      { rep: '', products: [], selectedTypes: [], customProducts: [], accProfit: '' }
    ]);
    setShowDisplay(false);
    setDisplayText('');
  };

  const displaySummary = () => {
    const today = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });
    let summary = `${today}\n\n`;

    repData.forEach(rep => {
      const filtered = rep.products.filter(p => p.qty > 0);
      const customs = rep.customProducts.filter(p => p.qty > 0);
      const all = [...filtered, ...customs];

      if (rep.rep && all.length > 0) {
        summary += `${rep.rep.toUpperCase()}: ` + all.map(p => {
          if (p.name === 'ACC' && rep.accProfit) {
            return `${p.qty} ${p.name} $${rep.accProfit}`;
          }
          return `${p.qty} ${p.name}`;
        }).join(', ') + `\n\n`;
      }
    });

    setDisplayText(summary.trim());
    setShowDisplay(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = displayText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(displayText)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      {!showDisplay && repData.map((rep, index) => (
        <div key={index} style={{
          marginBottom: '2.5rem',
          border: '1px solid #ddd',
          padding: '1.5rem',
          borderRadius: '15px',
          display: 'inline-block',
          minWidth: '300px'
        }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <select
              value={rep.rep || 'Select Rep'}
              onChange={e => handleRepChange(index, e.target.value)}
              style={{ padding: '0.7rem', fontSize: '1rem' }}
            >
              <option disabled>Select Rep</option>
              {reps.map(r => <option key={r}>{r}</option>)}
            </select>

            {rep.rep === '' && (
              <input
                type="text"
                placeholder="Enter Rep Code"
                value={rep.rep}
                onChange={e => handleOtherRepChange(index, e.target.value)}
                style={{ marginTop: '1rem', padding: '0.7rem', fontSize: '1rem', textTransform: 'uppercase' }}
              />
            )}
          </div>

          {rep.selectedTypes.map(type => (
            <div key={type} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{type} Products</h3>

              {type === 'Other' && rep.products.find(p => p.name === 'ACC' && p.qty > 0) && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '1rem' }}>ACC Profit: $</label>
                  <input
                    type="number"
                    value={rep.accProfit}
                    onChange={e => handleAccProfitChange(index, e.target.value)}
                    style={{ marginLeft: '0.5rem', padding: '0.5rem', fontSize: '1rem', width: '120px' }}
                  />
                </div>
              )}

              {getProductsForRep(index, type).map(product => (
                <div key={product.name} style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '0.8rem'
                }}>
                  <span style={{ width: '150px', textAlign: 'right', marginRight: '1rem' }}>
                    {product.name}
                  </span>

                  <button style={{ padding: '0.5rem 0.8rem', fontSize: '1.05rem' }} onClick={() => handleProductQtyChange(index, product.name, Math.max(0, product.qty - 1))}>-</button>
                  <span style={{ margin: '0 15px', fontSize: '1.05rem' }}>{product.qty}</span>
                  <button style={{ padding: '0.5rem 0.8rem', fontSize: '1.05rem' }} onClick={() => handleProductQtyChange(index, product.name, product.qty + 1)}>+</button>
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: '1.5rem' }}>
            {['CBU', 'RPP', 'SMB', 'FIDO', 'Other'].map(type => (
              <button
                key={type}
                onClick={() => handleCustomerTypeClick(index, type)}
                disabled={!rep.rep || rep.selectedTypes.includes(type)}
                style={{ margin: '0.4rem', padding: '0.5rem 1rem', fontSize: '1rem' }}
              >
                {type}
              </button>
            ))}

            <button
              onClick={() => handleCustomProductChange(index, prompt('Enter Custom Product Name') || '', 1)}
              style={{ margin: '0.4rem', padding: '0.5rem 1rem', fontSize: '1rem' }}
            >
              None
            </button>
          </div>
        </div>
      ))}

      {!showDisplay && (
        <div style={{ marginTop: '2rem' }}>
          <button style={{ padding: '0.5rem 1rem', margin: '0.5rem', fontSize: '1rem' }} onClick={addRep}>Add Rep</button>
          <button style={{ padding: '0.5rem 1rem', margin: '0.5rem', fontSize: '1rem' }} onClick={displaySummary}>Display</button>
          <button style={{ padding: '0.5rem 1rem', margin: '0.5rem', fontSize: '1rem' }} onClick={clearAll}>Clear All</button>
        </div>
      )}

      {showDisplay && (
        <div style={{ padding: '1.5rem' }}>
          <textarea value={displayText} readOnly style={{ width: '90vw', height: '80vh', fontSize: '1.05rem', padding: '1rem' }} />

          <div style={{ marginTop: '1rem' }}>
            <button style={{ padding: '0.5rem 1rem', margin: '0.5rem' }} onClick={copyToClipboard}>Copy</button>
            <button style={{ padding: '0.5rem 1rem', margin: '0.5rem' }} onClick={() => setShowDisplay(false)}>Back</button>
            <button style={{ padding: '0.5rem 1rem', margin: '0.5rem', backgroundColor: '#25D366', color: 'white' }} onClick={shareToWhatsApp}>WhatsApp</button>
          </div>
        </div>
      )}
    </div>
  );
}
