import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useWallet } from '../../../hooks/use-wallets';
import {
  createCertificate,
  revokeCertificate,
  getCertificatesByAddress,
  isAdmin,
  Certificate,
} from '../api/certificationService';
import { PageContentHeader } from '@/components/page-content-header';

export const CertificationManagement = () => {
  const { signer, address } = useWallet();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');

  const [form, setForm] = useState({
    studentName: '',
    certificateName: '',
    year: new Date().getFullYear(),
    score: 0,
    studentAddress: '',
  });


  useEffect(() => {
    if (signer && address) {
      isAdmin(signer, address).then(setIsAdminUser).catch(console.error);
    }
  }, [signer, address]);

  const handleSearch = async () => {
    if (!signer || !searchAddress) return;
    setLoading(true);
    setError(null);
    try {
      const certs = await getCertificatesByAddress(signer, searchAddress);
      setCertificates(certs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!signer) return;
    setLoading(true);
    setError(null);
    try {
      await createCertificate(
        signer,
        form.studentName,
        form.certificateName,
        form.year,
        form.score,
        form.studentAddress
      );
      setSuccess('Certificate created successfully!');
      setOpenDialog(false);
      setForm({ studentName: '', certificateName: '', year: new Date().getFullYear(), score: 0, studentAddress: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!signer) return;
    setLoading(true);
    setError(null);
    try {
      await revokeCertificate(signer, id);
      setSuccess('Certificate revoked successfully!');
      handleSearch();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <Box p={3}>
        <Alert severity="warning">Please connect your wallet to manage certificates.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageContentHeader heading="Certification Management" />

      <Box p={3}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Search Certificates</Typography>
            <Box display="flex" gap={2}>
              <TextField
                label="Student Address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleSearch} disabled={loading}>
                Search
              </Button>
            </Box>
          </CardContent>
        </Card>

        {isAdminUser && (
          <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} sx={{ mb: 3 }}>
            Issue New Certificate
          </Button>
        )}

        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Certificate</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                {isAdminUser && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>{cert.id}</TableCell>
                  <TableCell>{cert.studentName}</TableCell>
                  <TableCell>{cert.certificateName}</TableCell>
                  <TableCell>{cert.year}</TableCell>
                  <TableCell>{cert.score}</TableCell>
                  <TableCell>
                    <Chip
                      label={cert.valid ? 'Valid' : 'Revoked'}
                      color={cert.valid ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  {isAdminUser && (
                    <TableCell>
                      {cert.valid && (
                        <Button size="small" color="error" onClick={() => handleRevoke(cert.id)}>
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Issue New Certificate</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField
                label="Student Name"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              />
              <TextField
                label="Certificate Name"
                value={form.certificateName}
                onChange={(e) => setForm({ ...form, certificateName: e.target.value })}
              />
              <TextField
                label="Year"
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              />
              <TextField
                label="Score"
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              />
              <TextField
                label="Student Wallet Address"
                value={form.studentAddress}
                onChange={(e) => setForm({ ...form, studentAddress: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate} disabled={loading}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

// export default CertificationManagement;
