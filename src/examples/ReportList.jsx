import React from 'react';

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  row: (index) => ({
    background: index % 2 === 0 ? '#f8f9fa' : '#e9ecef',
    transition: 'background 0.2s',
    height: 'auto',
  }),
  cell: {
    padding: '12px 8px',
    verticalAlign: 'top',
    maxWidth: 0,
    overflow: 'hidden',
  },
  thumbnails: {
    display: 'flex',
    gap: 8,
    minWidth: 120,
    maxWidth: 180,
  },
  thumb: {
    width: 48,
    height: 48,
    objectFit: 'cover',
    borderRadius: 4,
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s',
  },
  thumbHover: {
    position: 'absolute',
    zIndex: 10,
    width: 180,
    height: 180,
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    background: '#fff',
    objectFit: 'contain',
    top: -70,
    left: 0,
  },
  description: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    maxHeight: '3.6em',
    lineHeight: '1.2em',
    margin: 0,
  },
  reportLine: {
    maxHeight: 64,
    overflow: 'hidden',
    transition: 'max-height 0.2s',
  },
};

function Thumbnail({ src }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={src}
        alt="thumbnail"
        style={styles.thumb}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
      />
      {hover && (
        <img
          src={src}
          alt="enlarged"
          style={styles.thumbHover}
        />
      )}
    </span>
  );
}

export default function ReportList({ reports }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th>Thumbnails</th>
          <th>Description</th>
          <th>Category</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report, idx) => (
          <tr key={report.id} style={styles.row(idx)}>
            <td style={styles.cell}>
              <div style={styles.thumbnails}>
                {(report.thumbnails || []).slice(0, 3).map((src, i) => (
                  <Thumbnail src={src} key={i} />
                ))}
                {[...Array(3 - (report.thumbnails ? report.thumbnails.length : 0))].map((_, i) => (
                  <span key={i + 'empty'} style={{ width: 48, height: 48, display: 'inline-block' }} />
                ))}
              </div>
            </td>
            <td style={{ ...styles.cell, ...styles.reportLine }}>
              <p style={styles.description} title={report.description}>{report.description}</p>
            </td>
            <td style={styles.cell}>{report.category || '-'}</td>
            <td style={styles.cell}>{report.status || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 