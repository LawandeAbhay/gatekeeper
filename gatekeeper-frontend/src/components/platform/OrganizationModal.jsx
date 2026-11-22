import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { createOrganization, updateOrganization } from '../../api/platform';
import { useToast } from '../../context/ToastContext';

export default function OrganizationModal({ isOpen, onClose, organization, onSaved }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setSlug(organization.slug || '');
    } else {
      setName('');
      setSlug('');
    }
    setError(null);
  }, [organization, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (organization?.id) {
        await updateOrganization(organization.id, { name, slug });
        toast('Organization updated', `${name} has been successfully updated.`);
      } else {
        await createOrganization({ name, slug });
        toast('Organization created', `${name} has been provisioned.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save organization.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    // If creating a new organization and slug has not been manually touched or matches previous auto-slug
    if (!organization) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(autoSlug);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="PLATFORM OPERATION"
      title={organization ? 'Edit organization' : 'New organization'}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}

          <div className="form-grid">
            <label className="field form-span-2">
              <span>Organization Name</span>
              <input
                type="text"
                maxLength={150}
                placeholder="e.g. FoodFast Delivery"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
              />
            </label>

            <label className="field form-span-2">
              <span>Organization URL Slug</span>
              <input
                type="text"
                maxLength={100}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="e.g. foodfast"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
              />
              <small>Lowercase letters, numbers and hyphens. Used in API gateway route prefixes.</small>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="button button-quiet" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Saving...' : organization ? 'Save changes' : 'Create organization'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
