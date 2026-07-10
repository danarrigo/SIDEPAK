import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WithdrawForm from '@/components/WithdrawForm';

// Mock fetch
global.fetch = jest.fn();

describe('WithdrawForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<WithdrawForm />);
    
    expect(screen.getByText('Tarik Saldo')).toBeInTheDocument();
    expect(screen.getByLabelText('Jumlah Penarikan (Rp)')).toBeInTheDocument();
    expect(screen.getByLabelText('Bank Tujuan')).toBeInTheDocument();
    expect(screen.getByLabelText('Nomor Rekening / No. HP')).toBeInTheDocument();
    expect(screen.getByLabelText('Nama Pemilik Rekening')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tarik Dana Sekarang/i })).toBeInTheDocument();
  });

  it('handles user input correctly', () => {
    render(<WithdrawForm />);
    
    const amountInput = screen.getByLabelText('Jumlah Penarikan (Rp)');
    const bankSelect = screen.getByLabelText('Bank Tujuan');
    const accountInput = screen.getByLabelText('Nomor Rekening / No. HP');
    const nameInput = screen.getByLabelText('Nama Pemilik Rekening');

    fireEvent.change(amountInput, { target: { value: '50000' } });
    fireEvent.change(bankSelect, { target: { value: 'ID_MANDIRI' } });
    fireEvent.change(accountInput, { target: { value: '1234567890' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(amountInput).toHaveValue(50000);
    expect(bankSelect).toHaveValue('ID_MANDIRI');
    expect(accountInput).toHaveValue('1234567890');
    expect(nameInput).toHaveValue('John Doe');
  });

  it('handles successful withdrawal submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<WithdrawForm />);
    
    fireEvent.change(screen.getByLabelText('Jumlah Penarikan (Rp)'), { target: { value: '50000' } });
    fireEvent.change(screen.getByLabelText('Nomor Rekening / No. HP'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Nama Pemilik Rekening'), { target: { value: 'John Doe' } });

    const submitButton = screen.getByRole('button', { name: /Tarik Dana Sekarang/i });
    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent('Memproses...');
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/withdraw', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50000,
          bankCode: 'ID_BCA', // default
          accountNumber: '1234567890',
          accountName: 'John Doe',
        })
      }));
      expect(screen.getByText('Penarikan berhasil diproses! Saldo akan masuk setelah dikonfirmasi.')).toBeInTheDocument();
      // Form should be reset
      expect(screen.getByLabelText('Jumlah Penarikan (Rp)')).toHaveValue(null);
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Saldo tidak mencukupi' }),
    });

    render(<WithdrawForm />);
    
    fireEvent.change(screen.getByLabelText('Jumlah Penarikan (Rp)'), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText('Nomor Rekening / No. HP'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Nama Pemilik Rekening'), { target: { value: 'John Doe' } });

    fireEvent.click(screen.getByRole('button', { name: /Tarik Dana Sekarang/i }));

    await waitFor(() => {
      expect(screen.getByText('Saldo tidak mencukupi')).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<WithdrawForm />);
    
    fireEvent.change(screen.getByLabelText('Jumlah Penarikan (Rp)'), { target: { value: '50000' } });
    fireEvent.change(screen.getByLabelText('Nomor Rekening / No. HP'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Nama Pemilik Rekening'), { target: { value: 'John Doe' } });

    fireEvent.click(screen.getByRole('button', { name: /Tarik Dana Sekarang/i }));

    await waitFor(() => {
      expect(screen.getByText('Gagal terhubung ke server.')).toBeInTheDocument();
    });
  });
});
