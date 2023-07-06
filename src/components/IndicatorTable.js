import React from 'react';
import { Table, Checkbox } from 'antd';

export default function IndicatorTable({ indicator, selected, setSelected }) {
  const sharedOnCell = (_, index) => {
    if (index === 0) {
      return {
        rowSpan: indicator.dataElements.length,
      };
    }
    return {
      rowSpan: 0,
    };
  };

  const handleCheck = (e, indicator) => {
    if (e.target.checked) {
      setSelected([...selected, indicator]);
    } else {
      setSelected(selected.filter(ind => ind.id !== indicator.id));
    }
  };

  const columns = [
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      render: (text, row, i) => {
        return (
          <span>
            <Checkbox
              checked={selected.find(ind => ind.id === indicator.id)}
              onChange={e => handleCheck(e, indicator)}
            />
          </span>
        );
      },
      onCell: sharedOnCell,
      width: '5%',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: '10%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  return (
    <div>
      <Table
        showHeader={false}
        key={indicator.id}
        dataSource={indicator.dataElements}
        columns={columns}
        rowKey={indicator => indicator.id}
        pagination={false}
        bordered
      />
    </div>
  );
}
