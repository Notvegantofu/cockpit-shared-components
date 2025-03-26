import React, { ReactNode, useState } from "react";
import { Table, Thead, Tr, Th, Tbody, ThProps } from '@patternfly/react-table';
import { SearchInput, Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core'
import { LoadingData } from "./LoadingData";
import { MissingData } from "./MissingData";
import './styles.scss';

interface HeaderValue {
  text?: string;
  screenReaderText?: string;
  sortable?: boolean;
  filtrable?: boolean;
  width?: 15 | 10 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80 | 90 | 100;
  modifier?: "wrap" | "breakWord" | "fitContent" | "nowrap" | "truncate";
}

interface RowProps {
  row: ReactNode;
  values: (string | number)[];
}

interface TableProps {
  headerValues: HeaderValue[];
  rows: RowProps[];
  ready: boolean;
  additonalToolbarItems?: ReactNode[];
}

export const StandardTable: React.FunctionComponent<TableProps> = ({ headerValues, rows, ready, additonalToolbarItems }) => {
  const [ searchValue, setSearchValue ] = useState('');
  const filteredRows = rows.filter(onFilter);
  const [activeSortIndex, setActiveSortIndex] = useState(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc'|'desc'>('asc');

  function onFilter(row: RowProps) {
    if (searchValue === '') {
      return true;
    }

    let input: RegExp;
    try {
      input = new RegExp(searchValue, 'i');
    } catch (err) {
      input = new RegExp(searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    for (const value of row.values) {
      if (typeof value === "number") {
        continue
      }
      if (value.search(input) >= 0) {
        return true
      }
    }
    return false;
  };

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex
  });

  
  let sortedRows = filteredRows.sort((a, b) => {
    const aValue = a.values[activeSortIndex];
    const bValue = b.values[activeSortIndex];
    if (typeof aValue === 'string' || typeof bValue === 'string') {
      if (activeSortDirection === 'asc') {
        return (aValue as string).localeCompare(bValue as string);
      }
      return (bValue as string).localeCompare(aValue as string);
    }
    if (activeSortDirection === 'asc') {
      return aValue - bValue;
    }
    return bValue - aValue;
  });

  return (
    <>
      <Toolbar isSticky>
        <ToolbarContent>
          <ToolbarItem className="expand">
            <SearchInput
              placeholder={`Filter by ${headerValues.filter(value => value.filtrable).map(value => value.text).reduce((prev, curr) => `${prev} ${curr}`)}`}
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
            />
          </ToolbarItem>
          {additonalToolbarItems && additonalToolbarItems.map(item =>
            <ToolbarItem>
              {item}
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
      <Table
      aria-label="Table"
      variant='compact'
      >
        <Thead>
          <Tr>
            {headerValues.map((headerValue, index) =>
              <Th
                screenReaderText={headerValue.screenReaderText}
                width={headerValue.width}
                modifier={headerValue.modifier}
                sort={headerValue.sortable ? getSortParams(index) : undefined}
                textCenter
              >
                {headerValue.text}
              </Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {!ready? <LoadingData colSpan={6} /> : filteredRows.length === 0 ? <MissingData colSpan={6} /> : sortedRows.map(element => element.row)}
        </Tbody>
      </Table>
    </>
  )
}