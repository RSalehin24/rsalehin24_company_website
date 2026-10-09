import { DurableObject } from 'cloudflare:workers';
import { nextInquiryReference } from './inquiry-reference.mjs';

export class InquiryCounter extends DurableObject {
  nextReference() {
    return nextInquiryReference(this.ctx.storage);
  }
}
