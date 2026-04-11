"use client";
import { FaCalculator } from "react-icons/fa";
import { MdOutlineScale } from "react-icons/md";
import { MdScale } from "react-icons/md";
import { RiScales2Fill } from "react-icons/ri";
import { CiBeaker1 } from "react-icons/ci";
import { IoIosBeaker } from "react-icons/io";
import { CiViewTable } from "react-icons/ci";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

export const NaviBar = () => {
  return (
    <NavigationMenu.Root className="">
      <NavigationMenu.List className="">
        <NavigationMenu.Item className="">
          <NavigationMenu.Link asChild className="">
            <Link href="/" className="NavigationMenuRoot">
              <FaCalculator className="inline-block mr-2 mb-1 " />
              ホーム
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item className="relative">
          <NavigationMenu.Trigger className="NavigationMenuRoot">
            %計算
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <NavigationMenu.Link asChild className="">
              <Link href="/proportion" className="NavigationMenuSubRoot">
                <MdOutlineScale className="inline-block mr-2 mb-1" />
                実量 → %
              </Link>
            </NavigationMenu.Link>
            <NavigationMenu.Link asChild className="">
              <Link href="/prorate" className="NavigationMenuSubRoot">
                <MdScale className="inline-block mr-2 mb-1" />% → 実量
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild className="">
            <Link href="/percent" className="NavigationMenuRoot">
              <CiBeaker1 className="inline-block mr-2 mb-1" />
              濃度計算
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild className="">
            <Link href="/dilution" className="NavigationMenuRoot">
              <IoIosBeaker className="inline-block mr-2 mb-1" />
              希釈計算
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item className="relative">
          <NavigationMenu.Trigger className="NavigationMenuRoot">
            実験計画法
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <NavigationMenu.Link asChild className="">
              <Link
                href="/exp-design/orthogonal-array-l8"
                className="NavigationMenuSubRoot"
              >
                <CiViewTable className="inline-block mr-2 mb-1" />
                L(8)表
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item className="relative">
          <NavigationMenu.Trigger className="NavigationMenuRoot">
            おまけ
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <NavigationMenu.Link asChild className="">
              <Link
                href="/bonus/serving-scale"
                className="NavigationMenuSubRoot"
              >
                <RiScales2Fill className="inline-block mr-2 mb-1" />
                料理を作る時の分量調整
              </Link>
            </NavigationMenu.Link>
            <NavigationMenu.Link asChild className="">
              <Link href="/bonus/alcohol" className="NavigationMenuSubRoot">
                <RiScales2Fill className="inline-block mr-2 mb-1" />
                お酒に含まれるアルコール量は？
              </Link>
            </NavigationMenu.Link>
            {/* <NavigationMenu.Link asChild className="">
              <Link href="/bonus/jyotai" className="NavigationMenuSubRoot">
                <RiScales2Fill className="inline-block mr-2 mb-1" />
                jyotaiテスト
              </Link>
            </NavigationMenu.Link> */}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
