import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState, useEffect} from "react";
import {  groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import product from "@/sanity/schemaTypes/product";



export const useProduct = () => {
    return useQuery({ queryFn: ()=> client.fetch(groq `*[_type=="product"]`),
    queryKey: ["product"],
refetchInterval: false,
refetchOnMount: false,
refetchOnWindowFocus: false,
refetchOnReconnect: false,
refetchIntervalInBackground: false,});
}

type useCartItems = {
  product: any[],
  cartItems: any[],
  orderList: any[ ]
}

export const useCartItems = () => {
const [cartItems, setCartItems] = useState<any[]>([]);
const [orderList, setOrdelist] = useState<any[]>([]);

  return useQuery(
    {queryFn: (cartItems:any)=>{
      setOrdelist((...orderList:any)=>[...orderList, cartItems])
    },
    queryKey: ["orderList"]
    }
  );
} 