import { mainnet, goerli, polygon } from "wagmi/chains";
import {
  WagmiWeb3ConfigProvider,
  MetaMask,
  Goerli,
  Polygon,
  WalletConnect,
} from "@ant-design/web3-wagmi";
import {
  Address,
  ConnectButton,
  Connector,
  NFTCard,
  useAccount,
  useProvider
} from "@ant-design/web3";
import { Button, message } from "antd";
import { parseEther } from "viem";
import {
  createConfig,
  http,
  useReadContract,
  useWriteContract,
  useWatchContractEvent,
} from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

const config = createConfig({
  chains: [mainnet, goerli, polygon],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [
    injected({
      target: "metaMask",
    }),
    walletConnect({
      projectId: "c07c0051c2055890eade3556618e38a6",
      showQrModal: false,
    }),
  ],
});

const contractInfo = [
  {
    id:1,
    name: "Ethereum",
    contractAddress: "0xEcd0D12E21805803f70de03B72B1C162dB0898d9"
  }, {
    id:5,
    name: "Goerli",
    contractAddress: "0x418325c3979b7f8a17678ec2463a74355bdbe72c"
  }, {
    id:137,
    name: "Polygon",
    contractAddress: "0x418325c3979b7f8a17678ec2463a74355bdbe72c"
  }
]

const CallTest = () => {
  const { account } = useAccount();
  const {chain} = useProvider();
  const result = useReadContract({
    abi: [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ type: "uint256" }],
      },
    ],
    address: contractInfo.find((item) => item.id === chain?.id)?.contractAddress as `0x${string}`,
    functionName: "balanceOf",
    args: [account?.address as `0x${string}`],
  });
  const { writeContract } = useWriteContract();

  useWatchContractEvent({
    address: "0xEcd0D12E21805803f70de03B72B1C162dB0898d9",
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "minter",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "Minted",
        type: "event",
      },
    ],
    eventName: "Minted",
    onLogs() {
      message.success("new minted!");
    },
  });

  return (
    <div>
      {result.data?.toString()}
      <Button
        onClick={() => {
          writeContract(
            {
              abi: [
                {
                  type: "function",
                  name: "mint",
                  stateMutability: "payable",
                  inputs: [
                    {
                      internalType: "uint256",
                      name: "quantity",
                      type: "uint256",
                    },
                  ],
                  outputs: [],
                },
              ],
              address: contractInfo.find((item) => item.id === chain?.id)?.contractAddress as `0x${string}`,
              functionName: "mint",
              args: [1],
              value: parseEther("0.01"),
            },
            {
              onSuccess: () => {
                message.success("Mint Success");
              },
              onError: (err) => {
                message.error(err.message);
              },
            }
          );
        }}
      >
        mint
      </Button>
    </div>
  );
};

export default function Web3() {
  return (
    <WagmiWeb3ConfigProvider
      config={config}
      wallets={[MetaMask(), WalletConnect()]}
      eip6963={{
        autoAddInjectedWallets: true,
      }}
      chains={[Goerli, Polygon]}
    >
      <Address format address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9" />
      <NFTCard
        address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9"
        tokenId={641}
      />
      <Connector>
        <ConnectButton />
      </Connector>
      <CallTest />
    </WagmiWeb3ConfigProvider>
  );
}
