import { Contract, JsonRpcSigner } from 'ethers';
import CertificateRegistryABI from './CertificateRegistry.json';

const CONTRACT_ADDRESS = import.meta.env.CERTIFICATE_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
console.log("CONTRACT ADDRESS: ", CONTRACT_ADDRESS);

export interface Certificate {
  id: number;
  studentName: string;
  certificateName: string;
  year: number;
  score: number;
  student: string;
  issuer: string;
  valid: boolean;
}

export const getCertificateContract = (signer: JsonRpcSigner) => {
  return new Contract(CONTRACT_ADDRESS, CertificateRegistryABI.abi, signer);
};

export const isAdmin = async (signer: JsonRpcSigner, address: string): Promise<boolean> => {
  const contract = getCertificateContract(signer);
  const res = await contract.admins(address)
  console.log("IS ADMIN: ", res);
  return res;
};

export const createCertificate = async (
  signer: JsonRpcSigner,
  studentName: string,
  certificateName: string,
  year: number,
  score: number,
  studentAddress: string
): Promise<void> => {
  const contract = getCertificateContract(signer);
  const tx = await contract.newCertificate(studentName, certificateName, year, score, studentAddress);
  await tx.wait();
};

export const revokeCertificate = async (signer: JsonRpcSigner, id: number): Promise<void> => {
  const contract = getCertificateContract(signer);
  const tx = await contract.revokeCertificate(id);
  await tx.wait();
};

export const verifyCertificate = async (
  signer: JsonRpcSigner,
  studentName: string,
  certificateName: string
): Promise<boolean> => {
  const contract = getCertificateContract(signer);
  return contract.verifyCertificate(studentName, certificateName);
};

export const getCertificatesByAddress = async (
  signer: JsonRpcSigner,
  studentAddress: string
): Promise<Certificate[]> => {
  const contract = getCertificateContract(signer);
  const certs = await contract.getCertificatesByAddress(studentAddress);
  return certs.map((c: any) => ({
    id: Number(c.id),
    studentName: c.studentName,
    certificateName: c.certificateName,
    year: Number(c.year),
    score: Number(c.score),
    student: c.student,
    issuer: c.issuer,
    valid: c.valid,
  }));
};
