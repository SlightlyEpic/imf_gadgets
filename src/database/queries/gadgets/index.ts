import { createGadget } from './create-gadget';
import { getGadget } from './get-gadget';
import { getUserGadgetsByStatus } from './get-user-gadgets-by-status';
import { getUserGadgets } from './get-user-gadgets';
import { removeGadget } from './remove-gadget';
import { updateGadgetIfOwned } from './update-gadget-if-owned';

export const gadgets = {
    createGadget,
    getGadget,
    getUserGadgetsByStatus,
    getUserGadgets,
    removeGadget,
    updateGadgetIfOwned,
};
