import { createGadget } from './create-gadget';
import { getUserGadgetsByStatus } from './get-user-gadgets-by-status';
import { getUserGadgets } from './get-user-gadgets';
import { removeGadget } from './remove-gadget';
import { updateGadget } from './update-gadget';

export const gadgets = {
    createGadget,
    getUserGadgetsByStatus,
    getUserGadgets,
    removeGadget,
    updateGadget,
};
