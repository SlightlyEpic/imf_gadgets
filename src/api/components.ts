/**
 * @openapi
 * components:
 *   schemas:
 *     Gadget:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         ownerId:
 *           type: string
 *           format: uuid
 *           example: "030927c2-d23f-413a-b163-dde90be4736a"
 *         name:
 *           type: string
 *           example: "Spectral Wraith"
 *         status:
 *           type: string
 *           enum: ["Available", "Deployed", "Destroyed", "Decommissioned"]
 *           example: "Available"
 *         decommissionedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *
 *     GadgetWithSuccessProbability:
 *       allOf:
 *         - $ref: "#/components/schemas/Gadget"
 *         - type: object
 *           properties:
 *             missionSuccessProbability:
 *               type: integer
 *               minimum: 0
 *               maximum: 100
 *               example: 87
 */

export {};
