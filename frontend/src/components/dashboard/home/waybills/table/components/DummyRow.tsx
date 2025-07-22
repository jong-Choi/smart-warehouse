import { TableCell, TableRow } from "@ui/table";
import React from "react";

export const DummyRow = React.memo(() => (
  <TableRow className="opacity-0">
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
    <TableCell>
      <div className="invisible">-</div>
    </TableCell>
  </TableRow>
));
