import { useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPostForm, apiPut } from './api';

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

const initialCustomerUpdate = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  type: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
  ipAddress: '',
  dateOfBirth: '',
  ssn: '',
  businessName: '',
  businessType: '',
  businessClassification: '',
  ein: '',
  doingBusinessAs: '',
  website: '',
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
  idempotencyKey: '',
};

const initialMassPayment = {
  sourceFundingSourceId: '',
  correlationId: '',
  idempotencyKey: '',
  items: [
    { destinationFundingSourceId: '', amount: '', currency: 'USD', correlationId: '' },
  ],
};

const initialRefund = {
  transferId: '',
  amount: '',
  currency: 'USD',
  correlationId: '',
  idempotencyKey: '',
};

const initialPlaidFundingSource = {
  customerId: '',
  plaidToken: '',
  name: '',
};

const initialExchange = {
  customerId: '',
  token: '',
  finicityApplicationId: '',
};

const initialLabel = {
  amount: '',
  currency: 'USD',
};

const initialLabelLedgerEntry = {
  labelId: '',
  amount: '',
  currency: 'USD',
};

const initialLabelReallocation = {
  sourceLabelId: '',
  destinationLabelId: '',
  amount: '',
  currency: 'USD',
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

const initialBeneficialOwner = {
  customerId: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  ssn: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  passportNumber: '',
  passportCountry: 'US',
};

const initialBeneficialOwnership = {
  customerId: '',
  status: 'certified',
  beneficialOwnerId: '',
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
  const [customerUpdateForm, setCustomerUpdateForm] = useState(initialCustomerUpdate);
  const [customerActionId, setCustomerActionId] = useState('');
  const [customerUpgradeId, setCustomerUpgradeId] = useState('');
  const [customerIavId, setCustomerIavId] = useState('');
  const [iavToken, setIavToken] = useState('');
  const [fundingForm, setFundingForm] = useState(initialFundingSource);
  const [transferForm, setTransferForm] = useState(initialTransfer);
  const [massPaymentForm, setMassPaymentForm] = useState(initialMassPayment);
  const [customers, setCustomers] = useState([]);
  const [latestFundingSource, setLatestFundingSource] = useState(null);
  const [latestTransfer, setLatestTransfer] = useState(null);
  const [latestMassPayment, setLatestMassPayment] = useState(null);
  const [massPaymentItems, setMassPaymentItems] = useState([]);
  const [massPaymentLookupId, setMassPaymentLookupId] = useState('');
  const [plaidFundingForm, setPlaidFundingForm] = useState(initialPlaidFundingSource);
  const [fundingSources, setFundingSources] = useState([]);
  const [microDepositForm, setMicroDepositForm] = useState(initialMicroDeposit);
  const [microDepositStatus, setMicroDepositStatus] = useState(null);
  const [fundingSourcesCustomerId, setFundingSourcesCustomerId] = useState('');
  const [balanceLookupId, setBalanceLookupId] = useState('');
  const [fundingSourceBalance, setFundingSourceBalance] = useState(null);
  const [transferLookupId, setTransferLookupId] = useState('');
  const [transferDetails, setTransferDetails] = useState(null);
  const [cancelTransferId, setCancelTransferId] = useState('');
  const [refundForm, setRefundForm] = useState(initialRefund);
  const [transferReturns, setTransferReturns] = useState([]);
  const [returnsLookupId, setReturnsLookupId] = useState('');
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
  const [beneficialOwnerForm, setBeneficialOwnerForm] = useState(initialBeneficialOwner);
  const [beneficialOwners, setBeneficialOwners] = useState([]);
  const [beneficialOwnerDetail, setBeneficialOwnerDetail] = useState(null);
  const [beneficialOwnerLookupId, setBeneficialOwnerLookupId] = useState('');
  const [beneficialOwnershipForm, setBeneficialOwnershipForm] = useState(initialBeneficialOwnership);
  const [beneficialOwnershipStatus, setBeneficialOwnershipStatus] = useState(null);
  const [beneficialOwnerDeleteId, setBeneficialOwnerDeleteId] = useState('');
  const [businessClassifications, setBusinessClassifications] = useState([]);
  const [exchangePartners, setExchangePartners] = useState([]);
  const [exchangeForm, setExchangeForm] = useState(initialExchange);
  const [exchanges, setExchanges] = useState([]);
  const [labelForm, setLabelForm] = useState(initialLabel);
  const [labels, setLabels] = useState([]);
  const [ledgerEntryForm, setLedgerEntryForm] = useState(initialLabelLedgerEntry);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLabelId, setLedgerLabelId] = useState('');
  const [reallocationForm, setReallocationForm] = useState(initialLabelReallocation);
  const [customerBalanceId, setCustomerBalanceId] = useState('');
  const [customerBalance, setCustomerBalance] = useState(null);
  const [transferFailureId, setTransferFailureId] = useState('');
  const [transferFailure, setTransferFailure] = useState(null);
  const [microDepositStatusId, setMicroDepositStatusId] = useState('');
  const [rootDiscovery, setRootDiscovery] = useState(null);
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

  const loadRoot = async () => {
    await withFeedback(async () => {
      const root = await apiGet('/api/root');
      setRootDiscovery(root);
    }, 'Dwolla API root loaded.');
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

  const submitPlaidFundingSource = async (event) => {
    event.preventDefault();
    if (!plaidFundingForm.customerId || !plaidFundingForm.plaidToken || !plaidFundingForm.name) {
      setFeedback({ type: 'error', message: 'Provide customer ID, Plaid token, and account name.' });
      return;
    }

    await withFeedback(async () => {
      const created = await apiPost('/api/funding-sources/plaid', plaidFundingForm);
      setLatestFundingSource(created);
      setFundingSources((current) => [created, ...current]);
      setPlaidFundingForm(initialPlaidFundingSource);
    }, 'Plaid funding source created successfully.');
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

  const addMassPaymentItem = () => {
    setMassPaymentForm((prev) => ({
      ...prev,
      items: [...prev.items, { destinationFundingSourceId: '', amount: '', currency: 'USD', correlationId: '' }],
    }));
  };

  const updateMassPaymentItem = (index, field, value) => {
    setMassPaymentForm((prev) => {
      const items = prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
      return { ...prev, items };
    });
  };

  const removeMassPaymentItem = (index) => {
    setMassPaymentForm((prev) => {
      if (prev.items.length === 1) return prev;
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  const submitMassPayment = async (event) => {
    event.preventDefault();
    await withFeedback(async () => {
      const payload = {
        ...massPaymentForm,
        items: massPaymentForm.items.map((item) => ({
          ...item,
          amount: Number(item.amount),
        })),
      };
      const created = await apiPost('/api/transfers/mass-payments', payload);
      setLatestMassPayment(created);
      setMassPaymentItems([]);
      setMassPaymentForm(initialMassPayment);
    }, 'Mass payment submitted.');
  };

  const loadMassPayment = async (event) => {
    event.preventDefault();
    if (!massPaymentLookupId) {
      setFeedback({ type: 'error', message: 'Enter a mass payment ID to inspect.' });
      return;
    }

    await withFeedback(async () => {
      const summary = await apiGet(`/api/transfers/mass-payments/${massPaymentLookupId}`);
      const items = await apiGet(`/api/transfers/mass-payments/${massPaymentLookupId}/items?limit=50&offset=0`);
      setLatestMassPayment(summary);
      setMassPaymentItems(items);
    }, 'Mass payment details loaded.');
  };

  const submitRefund = async (event) => {
    event.preventDefault();
    if (!refundForm.transferId) {
      setFeedback({ type: 'error', message: 'Provide a transfer ID to refund.' });
      return;
    }

    await withFeedback(async () => {
      const result = await apiPost(`/api/transfers/${refundForm.transferId}/refunds`, {
        ...refundForm,
        amount: Number(refundForm.amount),
      });
      setTransferDetails(result);
      setRefundForm(initialRefund);
    }, 'Refund submitted.');
  };

  const loadTransferReturns = async (event) => {
    event.preventDefault();
    if (!returnsLookupId) {
      setFeedback({ type: 'error', message: 'Enter a transfer ID to list returns.' });
      return;
    }

    await withFeedback(async () => {
      const results = await apiGet(`/api/transfers/${returnsLookupId}/returns?limit=50&offset=0`);
      setTransferReturns(results);
    }, 'Transfer returns loaded.');
  };

  const loadCustomers = async () => {
    await withFeedback(async () => {
      const list = await apiGet('/api/customers?limit=25&offset=0');
      setCustomers(list);
    }, 'Customers loaded.');
  };

  const updateCustomer = async (event) => {
    event.preventDefault();
    if (!customerUpdateForm.id) {
      setFeedback({ type: 'error', message: 'Provide a customer ID to update.' });
      return;
    }

    const { id, ...payload } = customerUpdateForm;
    const trimmedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );

    await withFeedback(async () => {
      const updated = await apiPut(`/api/customers/${id}`, trimmedPayload);
      setCustomers((current) => current.map((c) => (c.id === updated.id ? updated : c)));
      setCustomerUpdateForm(initialCustomerUpdate);
    }, 'Customer updated.');
  };

  const changeCustomerStatus = async (customerId, action, successMessage) => {
    if (!customerId) {
      setFeedback({ type: 'error', message: 'Enter a customer ID first.' });
      return null;
    }

    const result = await withFeedback(async () => apiPost(`/api/customers/${customerId}/${action}`), successMessage);
    setCustomers((current) =>
      current.map((customer) => (customer.id === result.id ? { ...customer, status: result.status } : customer)),
    );
    return result;
  };

  const suspendCustomer = async (event) => {
    event.preventDefault();
    await changeCustomerStatus(customerActionId, 'suspend', 'Customer suspended.');
    setCustomerActionId('');
  };

  const deactivateCustomer = async (event) => {
    event.preventDefault();
    await changeCustomerStatus(customerActionId, 'deactivate', 'Customer deactivated.');
    setCustomerActionId('');
  };

  const reactivateCustomer = async (event) => {
    event.preventDefault();
    await changeCustomerStatus(customerActionId, 'reactivate', 'Customer reactivated.');
    setCustomerActionId('');
  };

  const upgradeCustomer = async (event) => {
    event.preventDefault();
    await changeCustomerStatus(customerUpgradeId, 'upgrade', 'Customer upgrade requested.');
    setCustomerUpgradeId('');
  };

  const fetchIavToken = async (event) => {
    event.preventDefault();
    if (!customerIavId) {
      setFeedback({ type: 'error', message: 'Provide a customer ID to request an IAV token.' });
      return;
    }

    await withFeedback(async () => {
      const token = await apiGet(`/api/customers/${customerIavId}/iav-token`);
      setIavToken(token.token);
    }, 'IAV token generated.');
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

  const loadBusinessClassifications = async () => {
    await withFeedback(async () => {
      const results = await apiGet('/api/directory/business-classifications?limit=100&offset=0');
      setBusinessClassifications(results);
    }, 'Business classifications loaded.');
  };

  const loadExchangePartners = async () => {
    await withFeedback(async () => {
      const partners = await apiGet('/api/exchanges/partners?limit=25&offset=0');
      setExchangePartners(partners);
    }, 'Exchange partners loaded.');
  };

  const loadExchanges = async () => {
    await withFeedback(async () => {
      const list = await apiGet('/api/exchanges?limit=25&offset=0');
      setExchanges(list);
    }, 'Exchanges loaded.');
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

  const createExchange = async (event) => {
    event.preventDefault();
    if (!exchangeForm.customerId || !exchangeForm.token) {
      setFeedback({ type: 'error', message: 'Provide customer ID and token to create an exchange.' });
      return;
    }

    await withFeedback(async () => {
      const created = await apiPost('/api/exchanges', exchangeForm);
      setExchanges((current) => [created, ...current]);
      setExchangeForm(initialExchange);
    }, 'Exchange created.');
  };

  const createLabel = async (event) => {
    event.preventDefault();
    if (!labelForm.amount) {
      setFeedback({ type: 'error', message: 'Enter a label amount.' });
      return;
    }

    await withFeedback(async () => {
      const created = await apiPost('/api/labels', {
        amount: Number(labelForm.amount),
        currency: labelForm.currency,
      });
      setLabels((current) => [created, ...current]);
      setLabelForm(initialLabel);
    }, 'Label created.');
  };

  const loadLabels = async () => {
    await withFeedback(async () => {
      const results = await apiGet('/api/labels?limit=50&offset=0');
      setLabels(results);
    }, 'Labels loaded.');
  };

  const loadLedgerEntries = async (event) => {
    event.preventDefault?.();
    const targetLabel = ledgerLabelId || ledgerEntryForm.labelId;
    if (!targetLabel) {
      setFeedback({ type: 'error', message: 'Provide a label ID to load ledger entries.' });
      return;
    }

    await withFeedback(async () => {
      const entries = await apiGet(`/api/labels/${targetLabel}/ledger-entries?limit=50&offset=0`);
      setLedgerEntries(entries);
      setLedgerLabelId(targetLabel);
    }, 'Ledger entries loaded.');
  };

  const createLedgerEntry = async (event) => {
    event.preventDefault();
    if (!ledgerEntryForm.labelId || !ledgerEntryForm.amount) {
      setFeedback({ type: 'error', message: 'Provide label ID and amount.' });
      return;
    }

    await withFeedback(async () => {
      const created = await apiPost(`/api/labels/${ledgerEntryForm.labelId}/ledger-entries`, {
        amount: Number(ledgerEntryForm.amount),
        currency: ledgerEntryForm.currency,
      });
      setLedgerEntries((current) => [created, ...current]);
    }, 'Ledger entry posted.');
  };

  const createLabelReallocation = async (event) => {
    event.preventDefault();
    const { sourceLabelId, destinationLabelId, amount, currency } = reallocationForm;
    if (!sourceLabelId || !destinationLabelId || !amount) {
      setFeedback({ type: 'error', message: 'Provide source label, destination label, and amount.' });
      return;
    }

    await withFeedback(async () => {
      await apiPost(`/api/labels/${sourceLabelId}/reallocations`, {
        destinationLabelId,
        amount: Number(amount),
        currency,
      });
      await loadLabels();
    }, 'Label reallocation created.');
  };

  const deleteLabel = async (labelId) => {
    await withFeedback(async () => {
      await apiDelete(`/api/labels/${labelId}`);
      setLabels((current) => current.filter((l) => l.id !== labelId));
    }, 'Label deleted.');
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

  const lookupCustomerBalance = async (event) => {
    event.preventDefault();
    if (!customerBalanceId) {
      setFeedback({ type: 'error', message: 'Enter a customer ID to check balance.' });
      return;
    }

    await withFeedback(async () => {
      const balance = await apiGet(`/api/customers/${customerBalanceId}/balance`);
      setCustomerBalance(balance);
    }, 'Customer balance loaded.');
  };

  const createBeneficialOwner = async (event) => {
    event.preventDefault();
    if (!beneficialOwnerForm.customerId) {
      setFeedback({ type: 'error', message: 'Provide a customer ID for the new beneficial owner.' });
      return;
    }

    await withFeedback(async () => {
      const { customerId, ...payload } = beneficialOwnerForm;
      const created = await apiPost(`/api/customers/${customerId}/beneficial-owners`, payload);
      setBeneficialOwnerForm(initialBeneficialOwner);
      setBeneficialOwnershipForm((current) => ({ ...current, customerId }));
      setBeneficialOwners((current) => [created, ...current]);
      return created;
    }, 'Beneficial owner created.');
  };

  const listBeneficialOwners = async (event) => {
    event.preventDefault?.();
    const customerId = beneficialOwnershipForm.customerId || beneficialOwnerForm.customerId;
    if (!customerId) {
      setFeedback({ type: 'error', message: 'Enter a customer ID to load beneficial owners.' });
      return;
    }

    await withFeedback(async () => {
      const owners = await apiGet(`/api/customers/${customerId}/beneficial-owners?limit=25&offset=0`);
      setBeneficialOwners(owners);
      setBeneficialOwnershipForm((current) => ({ ...current, customerId }));
    }, 'Beneficial owners loaded.');
  };

  const fetchBeneficialOwnerDetail = async (event) => {
    event.preventDefault();
    if (!beneficialOwnerLookupId) {
      setFeedback({ type: 'error', message: 'Provide a beneficial owner ID.' });
      return;
    }

    await withFeedback(async () => {
      const owner = await apiGet(`/api/beneficial-owners/${beneficialOwnerLookupId}`);
      setBeneficialOwnerDetail(owner);
    }, 'Beneficial owner loaded.');
  };

  const certifyBeneficialOwnership = async (event) => {
    event.preventDefault();
    if (!beneficialOwnershipForm.customerId) {
      setFeedback({ type: 'error', message: 'Provide a business customer ID to certify ownership.' });
      return;
    }

    await withFeedback(async () => {
      const certification = await apiPost(
        `/api/customers/${beneficialOwnershipForm.customerId}/beneficial-ownership/certify`,
        { status: beneficialOwnershipForm.status },
      );
      setBeneficialOwnershipStatus(certification);
    }, 'Beneficial ownership certification submitted.');
  };

  const fetchBeneficialOwnershipStatus = async (event) => {
    event.preventDefault();
    if (!beneficialOwnershipForm.customerId) {
      setFeedback({ type: 'error', message: 'Provide a customer ID to fetch beneficial ownership status.' });
      return;
    }

    await withFeedback(async () => {
      const status = await apiGet(`/api/customers/${beneficialOwnershipForm.customerId}/beneficial-ownership`);
      setBeneficialOwnershipStatus(status);
    }, 'Beneficial ownership status loaded.');
  };

  const attachBeneficialOwner = async (event) => {
    event.preventDefault();
    const { customerId, beneficialOwnerId } = beneficialOwnershipForm;
    if (!customerId || !beneficialOwnerId) {
      setFeedback({ type: 'error', message: 'Provide both customer ID and beneficial owner ID to attach.' });
      return;
    }

    await withFeedback(async () => {
      await apiPost(`/api/customers/${customerId}/beneficial-owners/${beneficialOwnerId}`);
      await listBeneficialOwners({ preventDefault: () => {} });
    }, 'Beneficial owner attached.');
    setBeneficialOwnershipForm((current) => ({ ...current, beneficialOwnerId: '' }));
  };

  const deleteBeneficialOwner = async (event) => {
    event.preventDefault();
    if (!beneficialOwnerDeleteId) {
      setFeedback({ type: 'error', message: 'Provide a beneficial owner ID to delete.' });
      return;
    }

    await withFeedback(async () => {
      await apiDelete(`/api/beneficial-owners/${beneficialOwnerDeleteId}`);
      setBeneficialOwners((current) => current.filter((o) => o.id !== beneficialOwnerDeleteId));
      setBeneficialOwnerDeleteId('');
    }, 'Beneficial owner removed.');
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

  const loadMicroDepositStatus = async (event) => {
    event.preventDefault();
    const targetId = microDepositStatusId || microDepositForm.fundingSourceId;
    if (!targetId) {
      setFeedback({ type: 'error', message: 'Provide a funding source ID to check micro-deposit status.' });
      return;
    }

    await withFeedback(async () => {
      const status = await apiGet(`/api/funding-sources/${targetId}/micro-deposits`);
      setMicroDepositStatus(status);
    }, 'Micro-deposit status loaded.');
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

  const lookupTransferFailure = async (event) => {
    event.preventDefault();
    if (!transferFailureId) {
      setFeedback({ type: 'error', message: 'Enter a transfer ID to inspect failure details.' });
      return;
    }

    await withFeedback(async () => {
      const failure = await apiGet(`/api/transfers/${transferFailureId}/failure`);
      setTransferFailure(failure);
    }, 'Transfer failure loaded.');
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
        <h2>Update Customer Profile</h2>
        <form className="form-grid" onSubmit={updateCustomer}>
          <label>
            Customer ID
            <input
              name="id"
              list="customerOptions"
              value={customerUpdateForm.id}
              onChange={handleChange(setCustomerUpdateForm)}
              required
            />
          </label>
          <label>
            First Name
            <input name="firstName" value={customerUpdateForm.firstName} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Last Name
            <input name="lastName" value={customerUpdateForm.lastName} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Email
            <input type="email" name="email" value={customerUpdateForm.email} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Type
            <select name="type" value={customerUpdateForm.type} onChange={handleChange(setCustomerUpdateForm)}>
              <option value="">Keep existing</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </label>
          <label>
            Address 1
            <input name="address1" value={customerUpdateForm.address1} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Address 2
            <input name="address2" value={customerUpdateForm.address2} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            City
            <input name="city" value={customerUpdateForm.city} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            State
            <input name="state" value={customerUpdateForm.state} onChange={handleChange(setCustomerUpdateForm)} maxLength={2} />
          </label>
          <label>
            Postal Code
            <input name="postalCode" value={customerUpdateForm.postalCode} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Phone
            <input name="phone" value={customerUpdateForm.phone} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            IP Address
            <input name="ipAddress" value={customerUpdateForm.ipAddress} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Date of Birth
            <input type="date" name="dateOfBirth" value={customerUpdateForm.dateOfBirth} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            SSN
            <input name="ssn" value={customerUpdateForm.ssn} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Business Name
            <input name="businessName" value={customerUpdateForm.businessName} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            DBA
            <input name="doingBusinessAs" value={customerUpdateForm.doingBusinessAs} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <label>
            Website
            <input name="website" value={customerUpdateForm.website} onChange={handleChange(setCustomerUpdateForm)} />
          </label>
          <button type="submit" disabled={busy}>Update Customer</button>
        </form>
      </section>

      <section>
        <h2>Customer Status &amp; Instant Verification</h2>
        <form className="form-grid inline-form" onSubmit={suspendCustomer}>
          <label>
            Customer ID
            <input
              name="customerActionId"
              list="customerOptions"
              value={customerActionId}
              onChange={(e) => setCustomerActionId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Suspend</button>
            <button type="button" onClick={deactivateCustomer} disabled={busy}>Deactivate</button>
            <button type="button" onClick={reactivateCustomer} disabled={busy}>Reactivate</button>
          </div>
        </form>

        <form className="form-grid inline-form" onSubmit={upgradeCustomer}>
          <label>
            Customer ID
            <input
              name="customerUpgradeId"
              list="customerOptions"
              value={customerUpgradeId}
              onChange={(e) => setCustomerUpgradeId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Upgrade to verified</button>
          </div>
        </form>

        <form className="form-grid inline-form" onSubmit={fetchIavToken}>
          <label>
            Customer ID
            <input
              name="customerIavId"
              list="customerOptions"
              value={customerIavId}
              onChange={(e) => setCustomerIavId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Generate IAV token</button>
          </div>
        </form>
        {iavToken && (
          <div className="transfer-details">
            <p className="small-note">Use this token to launch Dwolla IAV in your client application:</p>
            <pre className="code-block">{iavToken}</pre>
          </div>
        )}
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
        <h2>Beneficial Owners</h2>
        <form className="form-grid" onSubmit={createBeneficialOwner}>
          <label>
            Customer ID
            <input
              name="customerId"
              list="customerOptions"
              value={beneficialOwnerForm.customerId}
              onChange={handleChange(setBeneficialOwnerForm)}
              required
            />
          </label>
          <label>
            First Name
            <input name="firstName" value={beneficialOwnerForm.firstName} onChange={handleChange(setBeneficialOwnerForm)} required />
          </label>
          <label>
            Last Name
            <input name="lastName" value={beneficialOwnerForm.lastName} onChange={handleChange(setBeneficialOwnerForm)} required />
          </label>
          <label>
            Date of Birth
            <input type="date" name="dateOfBirth" value={beneficialOwnerForm.dateOfBirth} onChange={handleChange(setBeneficialOwnerForm)} required />
          </label>
          <label>
            SSN (last 4 or full)
            <input name="ssn" value={beneficialOwnerForm.ssn} onChange={handleChange(setBeneficialOwnerForm)} required />
          </label>
          <label>
            Address 1
            <input name="address1" value={beneficialOwnerForm.address1} onChange={handleChange(setBeneficialOwnerForm)} required />
          </label>
          <label>
            Address 2
            <input name="address2" value={beneficialOwnerForm.address2} onChange={handleChange(setBeneficialOwnerForm)} />
          </label>
          <label>
            City
            <input name="city" value={beneficialOwnerForm.city} onChange={handleChange(setBeneficialOwnerForm)} required />
          </label>
          <label>
            State
            <input name="state" value={beneficialOwnerForm.state} onChange={handleChange(setBeneficialOwnerForm)} required maxLength={2} />
          </label>
          <label>
            Postal Code
            <input name="postalCode" value={beneficialOwnerForm.postalCode} onChange={handleChange(setBeneficialOwnerForm)} required />
          </label>
          <label>
            Country
            <input name="country" value={beneficialOwnerForm.country} onChange={handleChange(setBeneficialOwnerForm)} />
          </label>
          <label>
            Passport Number (optional)
            <input name="passportNumber" value={beneficialOwnerForm.passportNumber} onChange={handleChange(setBeneficialOwnerForm)} />
          </label>
          <label>
            Passport Country
            <input name="passportCountry" value={beneficialOwnerForm.passportCountry} onChange={handleChange(setBeneficialOwnerForm)} />
          </label>
          <button type="submit" disabled={busy}>Add Beneficial Owner</button>
        </form>

        <form className="form-grid inline-form" onSubmit={listBeneficialOwners}>
          <label>
            Customer ID
            <input
              name="beneficialOwnershipCustomerId"
              list="customerOptions"
              value={beneficialOwnershipForm.customerId}
              onChange={(e) => setBeneficialOwnershipForm((current) => ({ ...current, customerId: e.target.value }))}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Beneficial Owners</button>
          </div>
        </form>

        <form className="form-grid inline-form" onSubmit={attachBeneficialOwner}>
          <label>
            Customer ID
            <input
              name="beneficialOwnershipCustomerId"
              list="customerOptions"
              value={beneficialOwnershipForm.customerId}
              onChange={(e) => setBeneficialOwnershipForm((current) => ({ ...current, customerId: e.target.value }))}
              required
            />
          </label>
          <label>
            Beneficial Owner ID
            <input
              name="beneficialOwnerId"
              value={beneficialOwnershipForm.beneficialOwnerId}
              onChange={(e) => setBeneficialOwnershipForm((current) => ({ ...current, beneficialOwnerId: e.target.value }))}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Attach to Customer</button>
          </div>
        </form>

        <form className="form-grid inline-form" onSubmit={certifyBeneficialOwnership}>
          <label>
            Business Customer ID
            <input
              name="beneficialOwnershipCustomerId"
              list="customerOptions"
              value={beneficialOwnershipForm.customerId}
              onChange={(e) => setBeneficialOwnershipForm((current) => ({ ...current, customerId: e.target.value }))}
              required
            />
          </label>
          <label>
            Certification Status
            <select
              name="status"
              value={beneficialOwnershipForm.status}
              onChange={(e) => setBeneficialOwnershipForm((current) => ({ ...current, status: e.target.value }))}
            >
              <option value="certified">Certified</option>
              <option value="recertified">Recertified</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Certify Beneficial Ownership</button>
          </div>
        </form>

        <form className="form-grid inline-form" onSubmit={fetchBeneficialOwnershipStatus}>
          <label>
            Customer ID
            <input
              name="beneficialOwnershipCustomerId"
              list="customerOptions"
              value={beneficialOwnershipForm.customerId}
              onChange={(e) => setBeneficialOwnershipForm((current) => ({ ...current, customerId: e.target.value }))}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Refresh Ownership Status</button>
          </div>
        </form>

        <form className="form-grid inline-form" onSubmit={fetchBeneficialOwnerDetail}>
          <label>
            Beneficial Owner ID
            <input
              name="beneficialOwnerLookupId"
              value={beneficialOwnerLookupId}
              onChange={(e) => setBeneficialOwnerLookupId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Fetch Beneficial Owner</button>
          </div>
        </form>

        <form className="form-grid inline-form" onSubmit={deleteBeneficialOwner}>
          <label>
            Beneficial Owner ID
            <input
              name="beneficialOwnerDeleteId"
              value={beneficialOwnerDeleteId}
              onChange={(e) => setBeneficialOwnerDeleteId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Delete Beneficial Owner</button>
          </div>
        </form>

        {beneficialOwnershipStatus && (
          <div className="transfer-details">
            <p>Beneficial ownership status: {beneficialOwnershipStatus.status}</p>
          </div>
        )}

        {beneficialOwnerDetail && (
          <div className="transfer-details">
            <p>
              Beneficial owner {beneficialOwnerDetail.firstName} {beneficialOwnerDetail.lastName} • Status {beneficialOwnerDetail.status}
            </p>
            <p className="small-note">Address: {beneficialOwnerDetail.address1 || 'n/a'} {beneficialOwnerDetail.city || ''} {beneficialOwnerDetail.state || ''}</p>
          </div>
        )}

        {beneficialOwners.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Status</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {beneficialOwners.map((owner) => (
                <tr key={owner.id}>
                  <td>{owner.firstName} {owner.lastName} ({owner.id})</td>
                  <td>{owner.status}</td>
                  <td>{owner.address1 || '-'} {owner.city || ''} {owner.state || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="small-note">No beneficial owners loaded.</p>
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
        <h2>Link Plaid Funding Source</h2>
        <form className="form-grid" onSubmit={submitPlaidFundingSource}>
          <label>
            Customer ID
            <input
              name="customerId"
              list="customerOptions"
              value={plaidFundingForm.customerId}
              onChange={handleChange(setPlaidFundingForm)}
              required
            />
          </label>
          <label>
            Plaid Processor Token
            <input name="plaidToken" value={plaidFundingForm.plaidToken} onChange={handleChange(setPlaidFundingForm)} required />
          </label>
          <label>
            Account Nickname
            <input name="name" value={plaidFundingForm.name} onChange={handleChange(setPlaidFundingForm)} required />
          </label>
          <button type="submit" disabled={busy}>Create from Plaid</button>
        </form>
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
        <h2>Customer Balance</h2>
        <form className="form-grid inline-form" onSubmit={lookupCustomerBalance}>
          <label>
            Customer ID
            <input
              name="customerBalanceId"
              list="customerOptions"
              value={customerBalanceId}
              onChange={(e) => setCustomerBalanceId(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Get balance</button>
          </div>
        </form>
        {customerBalance && (
          <div className="transfer-details">
            <p>
              Available: <strong>{customerBalance.available}</strong> {customerBalance.currency || 'USD'}
            </p>
            <p className="small-note">
              Last updated: {customerBalance.lastUpdated ? new Date(customerBalance.lastUpdated).toLocaleString() : 'n/a'}
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

        <form className="form-grid inline-form" onSubmit={loadMicroDepositStatus}>
          <label>
            Funding Source ID
            <input
              name="microDepositStatusId"
              list="fundingSourceOptions"
              value={microDepositStatusId}
              onChange={(e) => setMicroDepositStatusId(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Refresh status</button>
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
          <label>
            Idempotency Key
            <input name="idempotencyKey" value={transferForm.idempotencyKey} onChange={handleChange(setTransferForm)} />
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
        <h2>Transfer Failure Details</h2>
        <form className="form-grid inline-form" onSubmit={lookupTransferFailure}>
          <label>
            Transfer ID
            <input value={transferFailureId} onChange={(e) => setTransferFailureId(e.target.value)} required />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Failure</button>
          </div>
        </form>
        {transferFailure && (
          <div className="transfer-details">
            <p>Code: {transferFailure.code}</p>
            <p>Description: {transferFailure.description}</p>
            <p className="small-note">Explanation: {transferFailure.explanation}</p>
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
        <h2>Mass Payments</h2>
        <form className="form-grid" onSubmit={submitMassPayment}>
          <label>
            Source Funding Source ID
            <input
              name="sourceFundingSourceId"
              list="fundingSourceOptions"
              value={massPaymentForm.sourceFundingSourceId}
              onChange={handleChange(setMassPaymentForm)}
              required
            />
          </label>
          <label>
            Correlation ID
            <input name="correlationId" value={massPaymentForm.correlationId} onChange={handleChange(setMassPaymentForm)} />
          </label>
          <label>
            Idempotency Key
            <input name="idempotencyKey" value={massPaymentForm.idempotencyKey} onChange={handleChange(setMassPaymentForm)} />
          </label>

          <div className="divider" aria-hidden="true" />
          <h3>Items</h3>
          {massPaymentForm.items.map((item, index) => (
            <div key={`mp-item-${index}`} className="inline-form form-grid">
              <label>
                Destination Funding Source ID
                <input
                  list="fundingSourceOptions"
                  value={item.destinationFundingSourceId}
                  onChange={(e) => updateMassPaymentItem(index, 'destinationFundingSourceId', e.target.value)}
                  required
                />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) => updateMassPaymentItem(index, 'amount', e.target.value)}
                  required
                />
              </label>
              <label>
                Currency
                <input
                  value={item.currency}
                  onChange={(e) => updateMassPaymentItem(index, 'currency', e.target.value)}
                  required
                />
              </label>
              <label>
                Correlation ID
                <input
                  value={item.correlationId}
                  onChange={(e) => updateMassPaymentItem(index, 'correlationId', e.target.value)}
                />
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => removeMassPaymentItem(index)} disabled={massPaymentForm.items.length === 1}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="form-actions">
            <button type="button" onClick={addMassPaymentItem}>Add Item</button>
            <button type="submit" disabled={busy}>Submit Mass Payment</button>
          </div>
        </form>

        {latestMassPayment && (
          <div className="transfer-details">
            <p>
              Mass Payment <strong>{latestMassPayment.id}</strong> is <strong>{latestMassPayment.status}</strong> for a total of
              {` ${latestMassPayment.total} ${latestMassPayment.currency}`} (fees {latestMassPayment.totalFees}).
            </p>
            <p className="small-note">
              Created {new Date(latestMassPayment.created).toLocaleString()} • Correlation {latestMassPayment.correlationId ||
                'n/a'}
            </p>
          </div>
        )}

        <form className="form-grid inline-form" onSubmit={loadMassPayment}>
          <label>
            Mass Payment ID
            <input value={massPaymentLookupId} onChange={(e) => setMassPaymentLookupId(e.target.value)} required />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Details</button>
          </div>
        </form>

        {massPaymentItems.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Destination</th>
                  <th>Correlation</th>
                </tr>
              </thead>
              <tbody>
                {massPaymentItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.amount} {item.currency}
                    </td>
                    <td>{item.destinationFundingSourceId || 'n/a'}</td>
                    <td>{item.correlationId || 'n/a'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2>Transfer Refunds &amp; Returns</h2>
        <form className="form-grid" onSubmit={submitRefund}>
          <label>
            Transfer ID
            <input
              name="transferId"
              value={refundForm.transferId}
              onChange={handleChange(setRefundForm)}
              required
            />
          </label>
          <label>
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="amount"
              value={refundForm.amount}
              onChange={handleChange(setRefundForm)}
              required
            />
          </label>
          <label>
            Currency
            <input name="currency" value={refundForm.currency} onChange={handleChange(setRefundForm)} required />
          </label>
          <label>
            Correlation ID
            <input name="correlationId" value={refundForm.correlationId} onChange={handleChange(setRefundForm)} />
          </label>
          <label>
            Idempotency Key
            <input name="idempotencyKey" value={refundForm.idempotencyKey} onChange={handleChange(setRefundForm)} />
          </label>
          <button type="submit" disabled={busy}>Refund Transfer</button>
        </form>

        <form className="form-grid inline-form" onSubmit={loadTransferReturns}>
          <label>
            Transfer ID
            <input value={returnsLookupId} onChange={(e) => setReturnsLookupId(e.target.value)} required />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Returns</button>
          </div>
        </form>

        {transferReturns.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {transferReturns.map((ret) => (
                  <tr key={ret.id}>
                    <td>{ret.id}</td>
                    <td>{ret.status}</td>
                    <td>
                      {ret.amount} {ret.currency}
                    </td>
                    <td>{ret.code}</td>
                    <td>{ret.description}</td>
                    <td>{new Date(ret.created).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <h2>Business Classifications</h2>
        <div className="form-actions">
          <button type="button" onClick={loadBusinessClassifications} disabled={busy}>Load Classifications</button>
        </div>
        {businessClassifications.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Industry Codes</th>
                </tr>
              </thead>
              <tbody>
                {businessClassifications.map((bc) => (
                  <tr key={bc.id}>
                    <td>{bc.id}</td>
                    <td>{bc.name}</td>
                    <td>
                      {bc.industryClassifications && bc.industryClassifications.length > 0 ? (
                        <ul>
                          {bc.industryClassifications.map((ic) => (
                            <li key={ic.id}>{ic.id}: {ic.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>n/a</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="small-note">No classifications loaded yet.</p>
        )}
      </section>

      <section>
        <h2>Exchange Partners & Aggregator Exchanges</h2>
        <div className="form-actions">
          <button type="button" onClick={loadExchangePartners} disabled={busy}>Load Partners</button>
          <button type="button" onClick={loadExchanges} disabled={busy}>Load Exchanges</button>
        </div>

        <form className="form-grid" onSubmit={createExchange}>
          <label>
            Customer ID
            <input name="customerId" value={exchangeForm.customerId} onChange={handleChange(setExchangeForm)} required />
          </label>
          <label>
            Processor Token
            <input name="token" value={exchangeForm.token} onChange={handleChange(setExchangeForm)} required />
          </label>
          <label>
            Finicity Application ID (optional)
            <input
              name="finicityApplicationId"
              value={exchangeForm.finicityApplicationId}
              onChange={handleChange(setExchangeForm)}
              placeholder="Finicity applicationId"
            />
          </label>
          <button type="submit" disabled={busy}>Create Exchange</button>
        </form>

        {exchangePartners.length > 0 && (
          <div className="table-wrapper">
            <h3>Partners</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {exchangePartners.map((partner) => (
                  <tr key={partner.id}>
                    <td>{partner.name}</td>
                    <td>{partner.status}</td>
                    <td>{new Date(partner.created).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {exchanges.length > 0 && (
          <div className="table-wrapper">
            <h3>Exchanges</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {exchanges.map((ex) => (
                  <tr key={ex.id}>
                    <td>{ex.id}</td>
                    <td>{ex.status}</td>
                    <td>{new Date(ex.created).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2>Label Balances</h2>
        <div className="form-actions">
          <button type="button" onClick={loadLabels} disabled={busy}>Load Labels</button>
        </div>
        <form className="form-grid" onSubmit={createLabel}>
          <label>
            Amount
            <input name="amount" type="number" step="0.01" value={labelForm.amount} onChange={handleChange(setLabelForm)} required />
          </label>
          <label>
            Currency
            <input name="currency" value={labelForm.currency} onChange={handleChange(setLabelForm)} required />
          </label>
          <button type="submit" disabled={busy}>Create Label</button>
        </form>

        {labels.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label) => (
                <tr key={label.id}>
                  <td>{label.id}</td>
                  <td>{label.amount} {label.currency}</td>
                  <td>{new Date(label.created).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => deleteLabel(label.id)} disabled={busy}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Ledger Entries</h3>
        <form className="form-grid inline-form" onSubmit={loadLedgerEntries}>
          <label>
            Label ID
            <input name="ledgerLabelId" value={ledgerLabelId} onChange={(e) => setLedgerLabelId(e.target.value)} />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={busy}>Load Entries</button>
          </div>
        </form>

        <form className="form-grid" onSubmit={createLedgerEntry}>
          <label>
            Label ID
            <input name="labelId" value={ledgerEntryForm.labelId} onChange={handleChange(setLedgerEntryForm)} required />
          </label>
          <label>
            Amount (use negative to debit)
            <input
              name="amount"
              type="number"
              step="0.01"
              value={ledgerEntryForm.amount}
              onChange={handleChange(setLedgerEntryForm)}
              required
            />
          </label>
          <label>
            Currency
            <input name="currency" value={ledgerEntryForm.currency} onChange={handleChange(setLedgerEntryForm)} required />
          </label>
          <button type="submit" disabled={busy}>Post Ledger Entry</button>
        </form>

        {ledgerEntries.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.amount} {entry.currency}</td>
                  <td>{new Date(entry.created).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Reallocate Balances</h3>
        <form className="form-grid" onSubmit={createLabelReallocation}>
          <label>
            Source Label ID
            <input
              name="sourceLabelId"
              value={reallocationForm.sourceLabelId}
              onChange={handleChange(setReallocationForm)}
              required
            />
          </label>
          <label>
            Destination Label ID
            <input
              name="destinationLabelId"
              value={reallocationForm.destinationLabelId}
              onChange={handleChange(setReallocationForm)}
              required
            />
          </label>
          <label>
            Amount
            <input
              name="amount"
              type="number"
              step="0.01"
              value={reallocationForm.amount}
              onChange={handleChange(setReallocationForm)}
              required
            />
          </label>
          <label>
            Currency
            <input name="currency" value={reallocationForm.currency} onChange={handleChange(setReallocationForm)} required />
          </label>
          <button type="submit" disabled={busy}>Reallocate</button>
        </form>
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
        <h2>Dwolla API Root</h2>
        <div className="form-actions">
          <button type="button" onClick={loadRoot} disabled={busy}>Load Root</button>
        </div>
        {rootDiscovery && (
          <div className="transfer-details">
            <p>API Base: {rootDiscovery.apiBaseAddress}</p>
            <ul className="small-list">
              {Object.entries(rootDiscovery.links).map(([key, href]) => (
                <li key={key}>
                  <strong>{key}</strong>: {href}
                </li>
              ))}
            </ul>
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
