import { z } from 'zod';
import { BaseModule } from './base';
import {
  SourceCodeSchema,
  ContractCreationSchema,
  ABISchema,
  VerificationGuidSchema,
  ProxyVerificationStatusSchema,
  VerificationStatusSchema,
} from '../core/types';
import { Validators } from '../core/validators';

export class Contract extends BaseModule {
  /**
   * Verify zkSync Source Code
   * Submit zkSync source code for verification.
   */
  async verifyZkSyncSourceCode(params: {
    /** Parameter codeformat */
    codeformat?: string;
    /** Parameter sourceCode */
    sourceCode?: string;
    /** Parameter constructorArguments */
    constructorArguments?: string;
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter contractname */
    contractname?: string;
    /** Parameter compilerversion */
    compilerversion?: string;
    /** Parameter zksolcVersion */
    zksolcVersion?: string;
    /** Parameter compilermode */
    compilermode?: string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'verifysourcecode',
        codeformat: params.codeformat,
        sourceCode: params.sourceCode,
        constructorArguments: params.constructorArguments,
        contractaddress: params.contractaddress,
        contractname: params.contractname,
        compilerversion: params.compilerversion,
        zksolcVersion: params.zksolcVersion,
        compilermode: params.compilermode,
      },
      VerificationGuidSchema
    );
  }

  /**
   * Verify Stylus Source Code
   * Submit Stylus source code for verification.
   */
  async verifyStylus(params: {
    /** Parameter codeformat */
    codeformat?: string;
    /** Parameter sourceCode */
    sourceCode?: string;
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter contractname */
    contractname?: string;
    /** Parameter compilerversion */
    compilerversion?: string;
    /** Parameter licenseType */
    licenseType?: number | string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'verifysourcecode',
        codeformat: params.codeformat,
        sourceCode: params.sourceCode,
        contractaddress: params.contractaddress,
        contractname: params.contractname,
        compilerversion: params.compilerversion,
        licenseType: params.licenseType,
      },
      VerificationGuidSchema
    );
  }

  /**
   * Check Proxy Contract Verification Status
   * Check the status of a proxy contract verification.
   */
  async checkProxyVerification(params: {
    /** Parameter guid */
    guid?: string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'checkproxyverification',
        ...params,
      },
      ProxyVerificationStatusSchema
    );
  }

  /**
   * Get Contract Source Code
   * Retrieve the source code for a verified smart contract.
   */
  async getSourceCode(params: {
    /** Parameter address */
    address: string;
  }) {
    Validators.addressSchema(params.address, 'address');

    return this.transport.get(
      {
        module: 'contract',
        action: 'getsourcecode',
        ...params,
      },
      z.preprocess(Validators.safeJsonParse, z.array(SourceCodeSchema))
    );
  }

  /**
   * Verify Solidity Source Code
   * Submit Solidity source code for verification.
   */
  async verifySourceCode(params: {
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter sourceCode */
    sourceCode?: string;
    /** Parameter codeformat */
    codeformat?: string;
    /** Parameter contractname */
    contractname?: string;
    /** Parameter compilerversion */
    compilerversion?: string;
    /** Parameter optimizationUsed */
    optimizationUsed?: string;
    /** Parameter runs */
    runs?: string;
    /** Parameter constructorArguments */
    constructorArguments?: string;
    /** Parameter evmVersion */
    evmVersion?: string;
    /** Parameter licenseType */
    licenseType?: string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: params.contractaddress,
        sourceCode: params.sourceCode,
        codeformat: params.codeformat,
        contractname: params.contractname,
        compilerversion: params.compilerversion,
        optimizationUsed: params.optimizationUsed,
        runs: params.runs,
        constructorArguments: params.constructorArguments,
        evmVersion: params.evmVersion,
        licenseType: params.licenseType,
      },
      VerificationGuidSchema
    );
  }

  /**
   * Get Contract Creator and Creation Tx Hash
   * Retrieve a contract's deployer address and creation transaction.
   */
  async getContractCreation(params: {
    /** Parameter contractaddresses */
    contractaddresses?: string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'getcontractcreation',
        ...params,
      },
      z.array(ContractCreationSchema)
    );
  }

  /**
   * Verify Proxy Contract
   * Submit a proxy contract for verification.
   */
  async verifyProxyContract(params: {
    /** Parameter address */
    address: string;
    /** Parameter expectedimplementation */
    expectedimplementation?: string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'verifyproxycontract',
        ...params,
      },
      VerificationGuidSchema
    );
  }

  /**
   * Verify Vyper Source Code
   * Submit a Vyper contract for verification.
   */
  async verifyVyper(params: {
    /** Parameter codeformat */
    codeformat?: string;
    /** Parameter sourceCode */
    sourceCode?: string;
    /** Parameter constructorArguments */
    constructorArguments?: string;
    /** Parameter contractaddress */
    contractaddress: string;
    /** Parameter contractname */
    contractname?: string;
    /** Parameter compilerversion */
    compilerversion?: string;
    /** Parameter optimizationUsed */
    optimizationUsed?: string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'verifysourcecode',
        codeformat: params.codeformat,
        sourceCode: params.sourceCode,
        constructorArguments: params.constructorArguments,
        contractaddress: params.contractaddress,
        contractname: params.contractname,
        compilerversion: params.compilerversion,
        optimizationUsed: params.optimizationUsed,
      },
      VerificationGuidSchema
    );
  }

  /**
   * Get Contract ABI
   * Retrieve the ABI for a verified smart contract.
   */
  async getAbi(address: string): Promise<z.infer<typeof ABISchema>>;
  async getAbi(params: {
    /** Parameter address */
    address: string;
  }): Promise<z.infer<typeof ABISchema>>;
  async getAbi(addressOrParams: string | { address: string }) {
    const params = typeof addressOrParams === 'string' ? { address: addressOrParams } : addressOrParams;
    Validators.addressSchema(params.address, 'address');

    return this.transport.get(
      {
        module: 'contract',
        action: 'getabi',
        ...params,
      },
      z.preprocess(Validators.safeJsonParse, ABISchema)
    );
  }

  /**
   * Check Source Code Verification Status
   * Check the status of a source code verification request.
   */
  async checkVerifyStatus(params: {
    /** Parameter guid */
    guid?: string;
  }) {
    return this.transport.get(
      {
        module: 'contract',
        action: 'checkverifystatus',
        ...params,
      },
      VerificationStatusSchema
    );
  }
}
