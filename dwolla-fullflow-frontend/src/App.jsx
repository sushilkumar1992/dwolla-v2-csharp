import { useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPostForm } from './api';

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

const initialMicroDeposit = {
  fundingSourceId: '',
  amount1: '',
  amount2: '',
  currency: 'USD',
};

const initialTransfer = {
  sourceFundingSourceId: '',
  destinationFundingSourceId: '',
  amount: '',
  currency: 'USD',
  correlationId: '',
};

const initialWebhookSubscription = {
  url: '',
  secret: '',
};

const initialDocumentUpload = {
  customerId: '',
  documentType: 'license',
  file: null,
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
  const [microDepositForm, setMicroDepositForm] = useState(initialMicroDeposit);
  const [microDepositStatus, setMicroDepositStatus] = useState(null);
  const [fundingSourcesCustomerId, setFundingSourcesCustomerId] = useState('');
  const [balanceLookupId, setBalanceLookupId] = useState('');
  const [fundingSourceBalance, setFundingSourceBalance] = useState(null);
  const [transferLookupId, setTransferLookupId] = useState('');
  const [transferDetails, setTransferDetails] = useState(null);
  const [cancelTransferId, setCancelTransferId] = useState('');
  const [dwollaEvents, setDwollaEvents] = useState([]);
  const [eventFilters, setEventFilters] = useState({ resourceId: '', topic: '' });
  const [eventLookupId, setEventLookupId] = useState('');
  const [eventDetail, setEventDetail] = useState(null);
  const [webhookEvents, setWebhookEvents] = useState([]);
  const [webhookResourceFilter, setWebhookResourceFilter] = useState('');
  const [webhookSubscriptions, setWebhookSubscriptions] = useState([]);
  const [webhookSubscriptionForm, setWebhookSubscriptionForm] = useState(initialWebhookSubscription);
  const [documentForm, setDocumentForm] = useState(initialDocumentUpload);
  const [customerDocuments, setCustomerDocuments] = useState([]);
  const [documentLookupCustomerId, setDocumentLookupCustomerId] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', []);

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (setter, field) => (event) => {
    const file = event.target.files?.[0] || null;
    setter((prev) => ({ ...prev, [field]: file }));
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
      setFundingSourcesCustomerId(created.id);
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

  const loadCustomerDocuments = async (event, customerIdOverride) => {
    event.preventDefault?.();
    const targetCustomer = customerIdOverride || documentLookupCustomerId || documentForm.customerId;
    if (!targetCustomer) {
      setFeedback({ type: 'error', message: 'Enter a customer ID to load documents.' });
      return;
    }

    await withFeedback(async () => {
      const docs = await apiGet(`/api/customers/${targetCustomer}/documents?limit=25&offset=0`);
      setCustomerDocuments(docs);
      setDocumentLookupCustomerId(targetCustomer);
    }, 'Customer documents loaded.');
  };

  const checkFundingSourceBalance = async (event) => {
    event.preventDefault();
    if (!balanceLookupId) {
      setFeedback({ type: 'error', message: 'Enter a funding source ID to check balance.' });
      return;
    }

    await withFeedback(async () => {
      const balance = await apiGet(`/api/funding-sources/${balanceLookupId}/balance`);
      setFundingSourceBalance(balance);
    }, 'Funding source balance loaded.');
  };

  const initiateMicroDeposits = async (event) => {
    event.preventDefault();
    if (!microDepositForm.fundingSourceId) {
      setFeedback({ type: 'error', message: 'Enter a funding source ID to initiate micro-deposits.' });
      return;
    }

    await withFeedback(async () => {
      const status = await apiPost(`/api/funding-sources/${microDepositForm.fundingSourceId}/micro-deposits/initiate`, {});
      setMicroDepositStatus(status);
    }, 'Micro-deposits initiated.');
  };

  const verifyMicroDeposits = async (event) => {
    event.preventDefault();
    if (!microDepositForm.fundingSourceId) {
      setFeedback({ type: 'error', message: 'Enter a funding source ID to verify micro-deposits.' });
      return;
    }

    await withFeedback(async () => {
      const amount1 = Number(microDepositForm.amount1);
      const amount2 = Number(microDepositForm.amount2);
      if (Number.isNaN(amount1) || Number.isNaN(amount2)) {
        throw new Error('Enter valid numeric amounts for micro-deposit verification.');
      }
      const status = await apiPost(`/api/funding-sources/${microDepositForm.fundingSourceId}/micro-deposits/verify`, {
        amount1,
        amount2,
        currency: microDepositForm.currency,
      });
      setMicroDepositStatus(status);
      setMicroDepositForm((prev) => ({ ...prev, amount1: '', amount2: '' }));
    }, 'Micro-deposits verified.');
  };

  const uploadCustomerDocument = async (event) => {
    event.preventDefault();
    if (!documentForm.customerId) {
      setFeedback({ type: 'error', message: 'Enter a customer ID for the document upload.' });
      return;
    }

    if (!documentForm.file) {
      setFeedback({ type: 'error', message: 'Select a document file to upload.' });
      return;
    }

    const targetCustomerId = documentForm.customerId;
    const formData = new FormData();
    formData.append('documentType', documentForm.documentType);
    formData.append('file', documentForm.file);

    await withFeedback(async () => {
      await apiPostForm(`/api/customers/${targetCustomerId}/documents`, formData);
      setDocumentForm(initialDocumentUpload);
      await loadCustomerDocuments({ preventDefault: () => {} }, targetCustomerId);
    }, 'Document uploaded for review.');
  };

  const lookupTransfer = async (event) => {
    event.preventDefault();
    if (!transferLookupId) {
      setFeedback({ type: 'error', message: 'Enter a transfer ID to look up status.' });
      return;
    }

    await withFeedback(async () => {
      const details = await apiGet(`/api/transfers/${transferLookupId}`);
      setTransferDetails(details);
    }, 'Transfer status loaded.');
  };

  const cancelTransfer = async (event) => {
    event.preventDefault();
    if (!cancelTransferId) {
      setFeedback({ type: 'error', message: 'Enter a transfer ID to cancel.' });
      return;
    }

    await withFeedback(async () => {
      const details = await apiPost(`/api/transfers/${cancelTransferId}/cancel`, {});
      setTransferDetails(details);
      setCancelTransferId('');
    }, 'Transfer cancellation requested.');
  };

  const loadWebhookEvents = async (event) => {
    event.preventDefault();
    const resourceQuery = webhookResourceFilter ? `?resourceId=${encodeURIComponent(webhookResourceFilter)}` : '';
    await withFeedback(async () => {
      const events = await apiGet(`/api/webhooks/events${resourceQuery}`);
      setWebhookEvents(events);
    }, 'Webhook events loaded.');
  };

  const clearWebhookEvents = async () => {
    await withFeedback(async () => {
      await apiDelete('/api/webhooks/events');
      setWebhookEvents([]);
    }, 'Webhook log cleared.');
  };

  const loadWebhookSubscriptions = async () => {
    await withFeedback(async () => {
      const subscriptions = await apiGet('/api/webhooks/subscriptions?limit=50&offset=0');
      setWebhookSubscriptions(subscriptions);
    }, 'Webhook subscriptions loaded.');
  };

  const createWebhookSubscription = async (event) => {
    event.preventDefault();
    await withFeedback(async () => {
      const created = await apiPost('/api/webhooks/subscriptions', webhookSubscriptionForm);
      setWebhookSubscriptions((current) => [created, ...current]);
      setWebhookSubscriptionForm(initialWebhookSubscription);
    }, 'Webhook subscription created.');
  };

  const deleteWebhookSubscription = async (id) => {
    await withFeedback(async () => {
      await apiDelete(`/api/webhooks/subscriptions/${id}`);
      setWebhookSubscriptions((current) => current.filter((sub) => sub.id !== id));
    }, 'Webhook subscription deleted.');
  };

  const markTransferFundingSource = (fundingSourceId, slot) => {
    setTransferForm((prev) => ({ ...prev, [slot]: fundingSourceId }));
    setFeedback(null);
  };

  const loadDwollaEvents = async (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ limit: 25, offset: 0 });
    if (eventFilters.resourceId) {
      params.append('resourceId', eventFilters.resourceId);
    }
    if (eventFilters.topic) {
      params.append('topic', eventFilters.topic);
    }

    await withFeedback(async () => {
      const events = await apiGet(`/api/events?${params.toString()}`);
      setDwollaEvents(events);
    }, 'Dwolla events loaded.');
  };

  const lookupEvent = async (event) => {
    event.preventDefault();
    if (!eventLookupId) {
      setFeedback({ type: 'error', message: 'Enter an event ID to fetch details.' });
      return;
    }

    await withFeedback(async () => {
      const detail = await apiGet(`/api/events/${eventLookupId}`);
      setEventDetail(detail);
    }, 'Dwolla event loaded.');
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
        <h2>Customer Identity Documents</h2>
        <form className="form-grid" onSubmit={uploadCustomerDocument}>
          <label>
            Customer ID
            <input
              name="customerId"
              list="customerOptions"
              value={documentForm.customerId}
              onChange={handleChange(setDocumentForm)}
              required
            />
          </label>
          <label>
            Document Type
            <select name="documentType" value={documentForm.documentType} onChange={handleChange(setDocumentForm)}>
              <option value="license">Driver License</option>
              <option value="passport">Passport</option>
              <option value="idCard">Government ID Card</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Document File
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange(setDocumentForm, 'file')} required />
          </label>
          <button type="submit" disabled={busy}>Upload Document</button>
        </form>

        <form className="form-grid inline-form" onSubmit={loadCustomerDocuments}>
          <label>
            Customer ID
            <input
              name="documentLookupCustomerId"
              value={documentLookupCustomerId}
              onChange={(e) => setDocumentLookupCustomerId(e.target.value)}
              placeholder="Customer to load documents"
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Documents</button>
          </div>
        </form>

        {customerDocuments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Failure Reason</th>
              </tr>
            </thead>
            <tbody>
              {customerDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>{doc.type}</td>
                  <td>{doc.status}</td>
                  <td>{new Date(doc.created).toLocaleString()}</td>
                  <td>{doc.failureReason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No documents loaded.</p>
        )}
      </section>

      <section>
        <h2>Link Funding Source</h2>
        <form className="form-grid" onSubmit={submitFundingSource}>
          <label>
            Customer ID
            <input
              name="customerId"
              list="customerOptions"
              value={fundingForm.customerId}
              onChange={handleChange(setFundingForm)}
              required
            />
          </label>
          <datalist id="customerOptions">
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName} ({customer.email})
              </option>
            ))}
          </datalist>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fundingSources.map((fs) => (
                <tr key={fs.id}>
                  <td>{fs.name} ({fs.id})</td>
                  <td>{fs.bankAccountType}</td>
                  <td>{fs.status}</td>
                  <td>{new Date(fs.created).toLocaleString()}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => markTransferFundingSource(fs.id, 'sourceFundingSourceId')}>
                        Use as source
                      </button>
                      <button type="button" onClick={() => markTransferFundingSource(fs.id, 'destinationFundingSourceId')}>
                        Use as destination
                      </button>
                      <button type="button" onClick={() => setMicroDepositForm((prev) => ({ ...prev, fundingSourceId: fs.id }))}>
                        Verify via micro-deposits
                      </button>
                      <button type="button" onClick={() => setBalanceLookupId(fs.id)}>
                        Check balance
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No funding sources loaded yet.</p>
        )}
      </section>

      <section>
        <h2>Funding Source Balance</h2>
        <form className="form-grid inline-form" onSubmit={checkFundingSourceBalance}>
          <label>
            Funding Source ID
            <input
              name="balanceLookupId"
              list="fundingSourceOptions"
              value={balanceLookupId}
              onChange={(e) => setBalanceLookupId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Get balance</button>
          </div>
        </form>
        {fundingSourceBalance && (
          <div className="transfer-details">
            <p>
              Balance: <strong>{fundingSourceBalance.balance}</strong> {fundingSourceBalance.currency || 'USD'}
            </p>
            <p className="small-note">
              Status: {fundingSourceBalance.status || 'unknown'} • Last updated:{' '}
              {fundingSourceBalance.lastUpdated ? new Date(fundingSourceBalance.lastUpdated).toLocaleString() : 'n/a'}
            </p>
          </div>
        )}
      </section>

      <section>
        <h2>Verify Funding Source (Micro-deposits)</h2>
        <form className="form-grid inline-form" onSubmit={initiateMicroDeposits}>
          <label>
            Funding Source ID
            <input
              name="fundingSourceId"
              list="fundingSourceOptions"
              value={microDepositForm.fundingSourceId}
              onChange={handleChange(setMicroDepositForm)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Send micro-deposits</button>
          </div>
        </form>

        <form className="form-grid" onSubmit={verifyMicroDeposits}>
          <label>
            Funding Source ID
            <input
              name="fundingSourceId"
              list="fundingSourceOptions"
              value={microDepositForm.fundingSourceId}
              onChange={handleChange(setMicroDepositForm)}
              required
            />
          </label>
          <label>
            Amount 1
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="amount1"
              value={microDepositForm.amount1}
              onChange={handleChange(setMicroDepositForm)}
              required
            />
          </label>
          <label>
            Amount 2
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="amount2"
              value={microDepositForm.amount2}
              onChange={handleChange(setMicroDepositForm)}
              required
            />
          </label>
          <label>
            Currency
            <input name="currency" value={microDepositForm.currency} onChange={handleChange(setMicroDepositForm)} required />
          </label>
          <button type="submit" disabled={busy}>Verify micro-deposits</button>
        </form>

        {microDepositStatus && (
          <div className="transfer-details">
            <p>
              Micro-deposit status: <strong>{microDepositStatus.status}</strong> (created {new Date(microDepositStatus.created).toLocaleString()})
            </p>
            {microDepositStatus.failureReason && (
              <p className="small-note">Failure: {microDepositStatus.failureReason}</p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2>Initiate Transfer</h2>
        <form className="form-grid" onSubmit={submitTransfer}>
          <label>
            Source Funding Source ID
            <input
              name="sourceFundingSourceId"
              list="fundingSourceOptions"
              value={transferForm.sourceFundingSourceId}
              onChange={handleChange(setTransferForm)}
              required
            />
          </label>
          <label>
            Destination Funding Source ID
            <input
              name="destinationFundingSourceId"
              list="fundingSourceOptions"
              value={transferForm.destinationFundingSourceId}
              onChange={handleChange(setTransferForm)}
              required
            />
          </label>
          <datalist id="fundingSourceOptions">
            {fundingSources.map((fs) => (
              <option key={fs.id} value={fs.id}>
                {fs.name} ({fs.bankAccountType})
              </option>
            ))}
          </datalist>
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
        <h2>Lookup Transfer Status</h2>
        <form className="form-grid inline-form" onSubmit={lookupTransfer}>
          <label>
            Transfer ID
            <input value={transferLookupId} onChange={(e) => setTransferLookupId(e.target.value)} required />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Check Transfer</button>
          </div>
        </form>
        {transferDetails && (
          <div className="transfer-details">
            <p>
              Transfer <strong>{transferDetails.id}</strong> is <strong>{transferDetails.status}</strong> for {transferDetails.amount}{' '}
              {transferDetails.currency}.
            </p>
            <p className="small-note">
              Created {new Date(transferDetails.created).toLocaleString()} • Correlation {transferDetails.correlationId || 'n/a'}
            </p>
            <p className="small-note">
              Source: {transferDetails.sourceFundingSourceId || 'unknown'} • Destination: {transferDetails.destinationFundingSourceId || 'unknown'}
            </p>
          </div>
        )}
      </section>

      <section>
        <h2>Cancel Transfer</h2>
        <form className="form-grid inline-form" onSubmit={cancelTransfer}>
          <label>
            Transfer ID
            <input value={cancelTransferId} onChange={(e) => setCancelTransferId(e.target.value)} required />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Cancel Transfer</button>
          </div>
        </form>
        {transferDetails && (
          <p className="small-note">Most recent transfer lookup/cancel result: {transferDetails.status}</p>
        )}
      </section>

      <section>
        <h2>Dwolla Events (API)</h2>
        <p className="small-note">
          Query events directly from Dwolla for reconciliation. Use resource/topic filters to narrow to specific
          transfers or customers.
        </p>
        <form className="form-grid inline-form" onSubmit={loadDwollaEvents}>
          <label>
            Resource ID
            <input
              name="resourceId"
              value={eventFilters.resourceId}
              onChange={handleChange(setEventFilters)}
              placeholder="optional"
            />
          </label>
          <label>
            Topic
            <input
              name="topic"
              value={eventFilters.topic}
              onChange={handleChange(setEventFilters)}
              placeholder="e.g. customer_verified"
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Events</button>
          </div>
        </form>

        {dwollaEvents.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Topic</th>
                <th>Resource</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {dwollaEvents.map((evt) => (
                <tr key={evt.id}>
                  <td>{evt.id}</td>
                  <td>{evt.topic}</td>
                  <td>{evt.resourceId}</td>
                  <td>{new Date(evt.created).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No Dwolla events loaded yet.</p>
        )}

        <form className="form-grid inline-form" onSubmit={lookupEvent}>
          <label>
            Event ID
            <input value={eventLookupId} onChange={(e) => setEventLookupId(e.target.value)} placeholder="dwolla event id" />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Lookup Event</button>
          </div>
        </form>
        {eventDetail && (
          <div className="transfer-details">
            <p>
              Event <strong>{eventDetail.id}</strong> on <strong>{eventDetail.topic}</strong> for resource
              {' '}
              {eventDetail.resourceId} at {new Date(eventDetail.created).toLocaleString()}.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2>Webhook Subscriptions</h2>
        <p className="small-note">
          Manage Dwolla webhook subscriptions directly from this environment. Use the same callback URL and secret you
          configured for the receiver below.
        </p>
        <form className="form-grid" onSubmit={createWebhookSubscription}>
          <label>
            Callback URL
            <input
              type="url"
              name="url"
              value={webhookSubscriptionForm.url}
              onChange={handleChange(setWebhookSubscriptionForm)}
              required
            />
          </label>
          <label>
            Shared Secret
            <input
              name="secret"
              value={webhookSubscriptionForm.secret}
              onChange={handleChange(setWebhookSubscriptionForm)}
              minLength={8}
              required
            />
          </label>
          <button type="submit" disabled={busy}>Create Subscription</button>
        </form>
        <div className="form-actions">
          <button type="button" onClick={loadWebhookSubscriptions} disabled={busy}>Load Subscriptions</button>
        </div>
        {webhookSubscriptions.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Callback</th>
                <th>Paused</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhookSubscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.id}</td>
                  <td>{sub.url}</td>
                  <td>{sub.paused ? 'Yes' : 'No'}</td>
                  <td>{new Date(sub.created).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => deleteWebhookSubscription(sub.id)} disabled={busy}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No webhook subscriptions loaded yet.</p>
        )}
      </section>

      <section>
        <h2>Webhook Events</h2>
        <p className="small-note">
          Configure your Dwolla webhook subscription to post to <strong>{apiBase}/api/webhooks</strong>. Events that validate the
          signature will be captured here in-memory.
        </p>
        <form className="form-grid inline-form" onSubmit={loadWebhookEvents}>
          <label>
            Filter by Resource ID
            <input
              name="webhookResourceFilter"
              value={webhookResourceFilter}
              onChange={(e) => setWebhookResourceFilter(e.target.value)}
              placeholder="optional"
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Refresh Events</button>
            <button type="button" onClick={clearWebhookEvents} disabled={busy}>Clear Log</button>
          </div>
        </form>

        {webhookEvents.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Topic</th>
                <th>Resource</th>
                <th>Occurred</th>
                <th>Received</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {webhookEvents.map((evt) => (
                <tr key={`${evt.id}-${evt.receivedAt}`}>
                  <td>{evt.id}</td>
                  <td>{evt.topic}</td>
                  <td>{evt.resourceId}</td>
                  <td>{evt.occurredAt ? new Date(evt.occurredAt).toLocaleString() : 'n/a'}</td>
                  <td>{evt.receivedAt ? new Date(evt.receivedAt).toLocaleString() : 'n/a'}</td>
                  <td>
                    <details>
                      <summary>View JSON</summary>
                      <pre className="code-block">{evt.rawPayload}</pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No webhook events captured yet.</p>
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
