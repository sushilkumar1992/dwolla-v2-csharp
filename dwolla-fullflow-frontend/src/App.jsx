import { useMemo, useState } from 'react';
import { apiGet, apiPost } from './api';

const initialCustomer = {
  firstName: '',
  lastName: '',
  email: '',
  type: 'personal',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
  ipAddress: '',
};

const initialFundingSource = {
  customerId: '',
  routingNumber: '',
  accountNumber: '',
  bankAccountType: 'checking',
  name: '',
};

const initialTransfer = {
  sourceFundingSourceId: '',
  destinationFundingSourceId: '',
  amount: '',
  currency: 'USD',
  correlationId: '',
};

function Feedback({ feedback }) {
  if (!feedback?.message) return null;
  return (
    <div className={`alert ${feedback.type}`}>
      {feedback.message}
    </div>
  );
}

function App() {
  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [fundingForm, setFundingForm] = useState(initialFundingSource);
  const [transferForm, setTransferForm] = useState(initialTransfer);
  const [customers, setCustomers] = useState([]);
  const [latestFundingSource, setLatestFundingSource] = useState(null);
  const [latestTransfer, setLatestTransfer] = useState(null);
  const [fundingSources, setFundingSources] = useState([]);
  const [fundingSourcesCustomerId, setFundingSourcesCustomerId] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', []);

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const withFeedback = async (action, successMessage) => {
    setBusy(true);
    setFeedback(null);
    try {
      const result = await action();
      if (successMessage) {
        setFeedback({ type: 'success', message: successMessage });
      }
      return result;
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Request failed' });
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const submitCustomer = async (event) => {
    event.preventDefault();
    await withFeedback(async () => {
      const created = await apiPost('/api/customers', customerForm);
      setCustomers((current) => [created, ...current]);
      setCustomerForm(initialCustomer);
    }, 'Customer created successfully.');
  };

  const submitFundingSource = async (event) => {
    event.preventDefault();
    await withFeedback(async () => {
      const { customerId, ...payload } = fundingForm;
      const created = await apiPost(`/api/funding-sources/customers/${customerId}`, payload);
      setLatestFundingSource(created);
      setFundingForm(initialFundingSource);
    }, 'Funding source created successfully.');
  };

  const submitTransfer = async (event) => {
    event.preventDefault();
    await withFeedback(async () => {
      const numericAmount = Number(transferForm.amount);
      const created = await apiPost('/api/transfers', {
        ...transferForm,
        amount: numericAmount,
      });
      setLatestTransfer(created);
      setTransferForm(initialTransfer);
    }, 'Transfer initiated successfully.');
  };

  const loadCustomers = async () => {
    await withFeedback(async () => {
      const list = await apiGet('/api/customers?limit=25&offset=0');
      setCustomers(list);
    }, 'Customers loaded.');
  };

  const loadFundingSources = async (event) => {
    event.preventDefault();
    if (!fundingSourcesCustomerId) {
      setFeedback({ type: 'error', message: 'Enter a customer ID to load funding sources.' });
      return;
    }

    await withFeedback(async () => {
      const list = await apiGet(`/api/funding-sources/customers/${fundingSourcesCustomerId}?limit=25&offset=0`);
      setFundingSources(list);
    }, 'Funding sources loaded.');
  };

  return (
    <div className="app-shell">
      <h1>Dwolla End-to-End Flow</h1>
      <p className="small-note">Backend API base URL: {apiBase}</p>

      <Feedback feedback={feedback} />

      <section>
        <h2>Create Customer</h2>
        <form className="form-grid" onSubmit={submitCustomer}>
          <label>
            First Name
            <input name="firstName" value={customerForm.firstName} onChange={handleChange(setCustomerForm)} required />
          </label>
          <label>
            Last Name
            <input name="lastName" value={customerForm.lastName} onChange={handleChange(setCustomerForm)} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={customerForm.email} onChange={handleChange(setCustomerForm)} required />
          </label>
          <label>
            Type
            <select name="type" value={customerForm.type} onChange={handleChange(setCustomerForm)}>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </label>
          <label>
            Address 1
            <input name="address1" value={customerForm.address1} onChange={handleChange(setCustomerForm)} required />
          </label>
          <label>
            Address 2
            <input name="address2" value={customerForm.address2} onChange={handleChange(setCustomerForm)} />
          </label>
          <label>
            City
            <input name="city" value={customerForm.city} onChange={handleChange(setCustomerForm)} required />
          </label>
          <label>
            State (2-letter)
            <input name="state" value={customerForm.state} onChange={handleChange(setCustomerForm)} required maxLength={2} />
          </label>
          <label>
            Postal Code
            <input name="postalCode" value={customerForm.postalCode} onChange={handleChange(setCustomerForm)} required />
          </label>
          <label>
            Phone
            <input name="phone" value={customerForm.phone} onChange={handleChange(setCustomerForm)} />
          </label>
          <label>
            IP Address
            <input name="ipAddress" value={customerForm.ipAddress} onChange={handleChange(setCustomerForm)} />
          </label>
          <button type="submit" disabled={busy}>Save Customer</button>
        </form>
      </section>

      <section>
        <h2>Link Funding Source</h2>
        <form className="form-grid" onSubmit={submitFundingSource}>
          <label>
            Customer ID
            <input name="customerId" value={fundingForm.customerId} onChange={handleChange(setFundingForm)} required />
          </label>
          <label>
            Routing Number
            <input name="routingNumber" value={fundingForm.routingNumber} onChange={handleChange(setFundingForm)} required />
          </label>
          <label>
            Account Number
            <input name="accountNumber" value={fundingForm.accountNumber} onChange={handleChange(setFundingForm)} required />
          </label>
          <label>
            Bank Account Type
            <select name="bankAccountType" value={fundingForm.bankAccountType} onChange={handleChange(setFundingForm)}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </label>
          <label>
            Account Nickname
            <input name="name" value={fundingForm.name} onChange={handleChange(setFundingForm)} required />
          </label>
          <button type="submit" disabled={busy}>Create Funding Source</button>
        </form>
        {latestFundingSource && (
          <div className="alert success">
            Funding source {latestFundingSource.name} ({latestFundingSource.id}) created with status {latestFundingSource.status}.
          </div>
        )}
      </section>

      <section>
        <h2>Customer Funding Sources</h2>
        <form className="form-grid inline-form" onSubmit={loadFundingSources}>
          <label>
            Customer ID
            <input
              name="fundingSourcesCustomerId"
              value={fundingSourcesCustomerId}
              onChange={(e) => setFundingSourcesCustomerId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Funding Sources</button>
          </div>
        </form>
        {fundingSources.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Funding Source</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {fundingSources.map((fs) => (
                <tr key={fs.id}>
                  <td>{fs.name} ({fs.id})</td>
                  <td>{fs.bankAccountType}</td>
                  <td>{fs.status}</td>
                  <td>{new Date(fs.created).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No funding sources loaded yet.</p>
        )}
      </section>

      <section>
        <h2>Initiate Transfer</h2>
        <form className="form-grid" onSubmit={submitTransfer}>
          <label>
            Source Funding Source ID
            <input
              name="sourceFundingSourceId"
              value={transferForm.sourceFundingSourceId}
              onChange={handleChange(setTransferForm)}
              required
            />
          </label>
          <label>
            Destination Funding Source ID
            <input
              name="destinationFundingSourceId"
              value={transferForm.destinationFundingSourceId}
              onChange={handleChange(setTransferForm)}
              required
            />
          </label>
          <label>
            Amount (USD)
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="amount"
              value={transferForm.amount}
              onChange={handleChange(setTransferForm)}
              required
            />
          </label>
          <label>
            Currency
            <input name="currency" value={transferForm.currency} onChange={handleChange(setTransferForm)} required />
          </label>
          <label>
            Correlation ID
            <input name="correlationId" value={transferForm.correlationId} onChange={handleChange(setTransferForm)} />
          </label>
          <button type="submit" disabled={busy}>Create Transfer</button>
        </form>
        {latestTransfer && (
          <div className="alert success">
            Transfer {latestTransfer.id} created for {latestTransfer.amount} {latestTransfer.currency} (status {latestTransfer.status}).
          </div>
        )}
      </section>

      <section>
        <h2>Customers</h2>
        <button type="button" onClick={loadCustomers} disabled={busy}>Load Customers</button>
        {customers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.firstName} {customer.lastName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.status}</td>
                  <td>{new Date(customer.created).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No customers loaded yet.</p>
        )}
      </section>
    </div>
  );
}

export default App;
