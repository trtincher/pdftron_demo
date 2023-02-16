import { FC, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';

interface Props {
  potentialSigners: {id: number, name: string, email: string, type: string}[],
  uniqueSignFields: Object,
  fields: { [key: number]: string },
  setFields: Function
}

const SignersTable: FC<Props> = ({potentialSigners, uniqueSignFields, fields, setFields}) => {

  useEffect(() => {
    setFields({})
  }, [])

  const handleChange = (index: number, event: SelectChangeEvent) => {
    console.log('fields', fields)
    let newFields: { [key: number]: string } = {...fields}
    console.log('newFields', newFields)
    newFields[index] = event.target.value as string
    setFields(newFields);
  };

  let signerOptions = (index: number) => (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Field</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={fields[index] }
          label="Field"
          onChange={(e) => handleChange(index, e)}
        >

          {Object.values(uniqueSignFields).map((field: string) => {
            return (<MenuItem value={field}>{field}</MenuItem>)
          })}
        </Select>
      </FormControl>
    </Box>
  )
  return (
    <TableContainer component={Paper}>
      <Table sx={{ maxWidth: 500 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Signer</TableCell>
            <TableCell align="left">Email</TableCell>
            <TableCell align="left">Type</TableCell>
            <TableCell align="left">Field</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {potentialSigners.map((row: {name: string, email: string, type: string}, index: number) => {
            return (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="left">{row.email}</TableCell>
              <TableCell align="left">{row.type}</TableCell>
              <TableCell align="left">{signerOptions(index)}</TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SignersTable;