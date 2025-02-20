export interface WalletCreationRequest {
    method: string,
    options: WalletOptions
}

export interface WalletOptions {
    key_type: string
}